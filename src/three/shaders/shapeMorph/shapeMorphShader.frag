#pragma glslify: simplex3d = require(glsl-noise/simplex/3d);

// Uniforms
uniform sampler2D tBackground;
uniform bool hasBackgroundTexture;

uniform float opacity;

uniform vec2 viewportSize;
uniform vec3 viewDirection;
uniform vec3 eyePosition;

uniform float time;

uniform int steps;
uniform float stepSizeMultiplier;
uniform float frequency;
uniform float falloff;

uniform float contrast;

uniform float warpOffset;
uniform float warpAmount;
uniform float backgroundWarpScale;

uniform vec3 color1;
uniform vec3 color2;

uniform float brightness;

uniform float alphaScale;
uniform float alphaContrast;

uniform float staticAmount;

uniform float blurSize;

// Lights
struct Light {
    vec3 position;
    vec3 color;
    float intensity;
    float decay;
};

//const int maxLights = 8;
#define MAX_LIGHTS 8

uniform int numberOfLights;
uniform Light lights[ MAX_LIGHTS ];

// Varying
varying vec2 vUv;
varying vec4 worldPosition;

float blurKernel[ 25 ] = float[] (
    1.0 / 256.0, 4.0 / 256.0, 6.0 / 256.0, 4.0 / 256.0, 1.0 / 256.0,
    4.0 / 256.0, 16.0 / 256.0, 24.0 / 256.0, 16.0 / 256.0, 4.0 / 256.0,
    6.0 / 256.0, 24.0 / 256.0, 36.0 / 256.0, 24.0 / 256.0, 6.0 / 256.0,
    4.0 / 256.0, 16.0 / 256.0, 24.0 / 256.0, 16.0 / 256.0, 4.0 / 256.0,
    1.0 / 256.0, 4.0 / 256.0, 6.0 / 256.0, 4.0 / 256.0, 1.0 / 256.0
);

vec4 blur( sampler2D tTexture, vec2 uv, float blurSize ) {
    vec4 color;

    int index;
    vec2 currentUV;
    for( int i = 0; i < 5; i++ ) {
        for( int j = 0; j < 5; j++ ) {
            index = i + j * 5;

            float b = blurKernel[ index ];

            currentUV = uv + blurSize * vec2( i - 2, j - 2 ) / viewportSize;
            
            vec4 colorSample = b * texture2D( tTexture, currentUV );

            color += colorSample;
        }
    }

    return color;
}

float random ( vec2 st ) {
    return fract( sin( dot( st.xy, vec2( 12.9898,78.233 ) ) ) * 43758.5453123 );
}

vec3 applySingleLight( vec3 baseColor, vec3 position, Light light ) {
    vec3 lightPosition = light.position;
    float dist = distance( position, lightPosition );

    float intensity = light.intensity / pow( dist, light.decay );

    return intensity * light.color;
}

vec3 applyLighting( vec3 baseColor, vec3 position ) {
    // TODO: Add option to cast occlusion rays from light!
    // TODO: use these rays to see how dense the object is between the position and the light

    //TODO use background texture to determine lighting as well? or environment map?

    if( numberOfLights == 0 ) return baseColor;

    vec3 lightColor;

    lightColor += applySingleLight( baseColor, position, lights[ 0 ] );
    if( numberOfLights == 1 ) return baseColor * lightColor;

    lightColor += applySingleLight( baseColor, position, lights[ 1 ] );
    if( numberOfLights == 2 ) return baseColor * lightColor;

    return baseColor * lightColor;
}

vec2 rotate2D( vec2 point, vec2 origin, float amount ) {
    return vec2(
        cos( amount ) * ( point.x - origin.x ) - sin( amount ) * ( point.y - origin.y ) + origin.x,
        sin( amount ) * ( point.x - origin.x ) - cos( amount ) * ( point.y - origin.y ) + origin.y
    );
}

void main() {
    int maxSteps = 100;
    float stepSize = stepSizeMultiplier / float( steps );

    vec3 eyeToFragment = worldPosition.xyz - eyePosition;
    vec3 direction = normalize( eyeToFragment.xyz );

    float divider = 0.0;
    float value = 0.0;
    float weightedValue = 0.0;

    vec2 backgroundUV = vec2( 0, 0 );
    vec3 color;

    for( int i = 0; i < min( steps, maxSteps ); i++ ) {
        float weight = pow( falloff, float( i ) );
        divider += weight;

        vec3 samplePosition = worldPosition.xyz + 
            direction * ( float( i ) * stepSize )
            //+ vec3( 1.0 * time, 0.0, 0.0 );
            ;

        /*float dist = distance( samplePosition, vec3( 0.0 ) );
        float r = dist * 1.0;

        samplePosition.xz = rotate2D( samplePosition.xz, vec2( 0.0 ), r );
        */

        float xOffset = 0.5 + simplex3d( frequency * samplePosition + vec3( warpOffset, 0.0, 0.0 )) / 2.0; 
        float yOffset = 0.5 + simplex3d( frequency * samplePosition + vec3( 0.0, warpOffset, 0.0 )) / 2.0; 
        float zOffset = 0.5 + simplex3d( frequency * samplePosition + vec3( 0.0, 0.0, warpOffset )) / 2.0; 

        float n = 0.5 + simplex3d( frequency * samplePosition + warpAmount * vec3( xOffset, yOffset, zOffset )) / 2.0; 

        backgroundUV += warpAmount * vec2( xOffset, yOffset );

        //n = clamp( n, 0.0, 1.0 );

        n = contrast * pow( n, contrast );
        n += staticAmount * ( random( vUv ) * 2.0 - 1.0 );
        n = clamp( n, 0.0, 1.0 );

        value += n;
        weightedValue += weight * n;

        color += n * mix(
            color1,
            color2,
            pow( float( i ) / float( steps ), falloff ) ); 


        if( numberOfLights > 0 ) {
            color = applyLighting( color, samplePosition );
        }
    }

    color *= brightness / value;

    value /= float( steps );
    weightedValue /= divider;

    backgroundUV *= backgroundWarpScale / float( steps );
    backgroundUV += gl_FragCoord.xy;
    backgroundUV /= viewportSize;

    float alpha = clamp( alphaContrast * pow( alphaScale * value, alphaContrast ), 0.0, 1.0 );

    if( hasBackgroundTexture ) {
        vec4 backgroundColor = blur( tBackground, backgroundUV, blurSize * ( 1.0 - weightedValue ) );

        gl_FragColor = vec4( mix( backgroundColor.rgb, color, alpha ), 1.0 );

    } else {
        gl_FragColor = opacity * vec4( color, alpha );
    }

}