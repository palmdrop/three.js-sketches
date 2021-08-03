#pragma glslify: simplex3d = require(glsl-noise/simplex/3d);

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

varying vec2 vUv;
varying vec4 worldPosition;

float blurKernel[25] = float[](
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

void main() {
    int maxSteps = 100;

    vec3 eyeToFragment = worldPosition.xyz - eyePosition;
    vec3 direction = normalize( eyeToFragment.xyz );

    float stepSize = stepSizeMultiplier / float( steps );


    float divider = 0.0;

    //TODO change color based on "distance" to viewer
    //TODO determine how FAST the value increases

    //TODO use accumulated sample value to determine alpha/threshold
    //TODO use speed of change (weighted using falloff) to determine hue?
    float value = 0.0;
    float weightedValue = 0.0;

    //vec2 uv = gl_FragCoord.xy / viewportSize;
    vec2 backgroundUV = vec2( 0, 0 );

    for( int i = 0; i < min( steps, maxSteps ); i++ ) {
        float weight = pow( falloff, float( i ) );
        divider += weight;

        vec3 samplePosition = worldPosition.xyz + 
            direction * ( float( i ) * stepSize )
            //+ vec3( 1.0 * time, 0.0, 0.0 );
            ;

        float xOffset = 0.5 + simplex3d( frequency * samplePosition + vec3( warpOffset, 0.0, 0.0 )) / 2.0; 
        float yOffset = 0.5 + simplex3d( frequency * samplePosition + vec3( 0.0, warpOffset, 0.0 )) / 2.0; 
        float zOffset = 0.5 + simplex3d( frequency * samplePosition + vec3( 0.0, 0.0, warpOffset )) / 2.0; 

        float n = 0.5 + simplex3d( frequency * samplePosition + warpAmount * vec3( xOffset, yOffset, zOffset )) / 2.0; 

        backgroundUV += warpAmount * vec2( xOffset, yOffset );

        n = clamp( n, 0.0, 1.0 );

        n = contrast * pow( n, contrast );

        n += staticAmount * ( random( vUv ) * 2.0 - 1.0 );

        value += n;
        weightedValue += weight * n;
    }

    value /= float( steps );
    weightedValue /= divider;

    backgroundUV *= backgroundWarpScale / float( steps );
    backgroundUV += gl_FragCoord.xy;
    backgroundUV /= viewportSize;

    vec3 color = brightness * mix(
        color1,
        color2,
        1.0 - weightedValue );

    float alpha = alphaContrast * pow( alphaScale * value, alphaContrast );

    //gl_FragColor = blur( tBackground, backgroundUV, blurSize );

    if( hasBackgroundTexture ) {
        //vec4 backgroundColor = texture2D( tBackground, backgroundUV );
        vec4 backgroundColor = blur( tBackground, backgroundUV, blurSize * ( 1.0 - weightedValue ) );

        gl_FragColor = vec4( mix( color, backgroundColor.rgb, 1.0 - alpha ), 1.0 );

    } else {
        gl_FragColor = opacity * vec4( color, alpha );
    }

}