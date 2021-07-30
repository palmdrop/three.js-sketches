#pragma glslify: simplex3d = require(glsl-noise/simplex/3d);

// Default
uniform float opacity;
uniform sampler2D tDiffuse;

varying vec2 vUv;

// Time
uniform float time;

// Dimensions
uniform vec2 size;
uniform vec3 offset;
uniform float z;

// Noise
uniform float frequency;
uniform float power;

// Color
uniform vec4 color1;
uniform vec4 color2;

// Dithering
uniform float ditheringAmount;
uniform bool hasDitheringTexture;
uniform highp sampler2D ditheringTexture;
uniform vec2 ditheringTextureDimensions;



float getNoise( vec3 position, float frequency, float amplitude, vec3 offset ) {
    vec3 samplePosition = position * frequency + offset;

    float result = simplex3d( samplePosition );
    result = 0.5 + result / 2.0;

    return amplitude * result;
}

float random(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 dither( vec3 value ) {
    if( !hasDitheringTexture ) return value;

    vec2 coord = gl_FragCoord.xy / ditheringTextureDimensions + vec2( 13.144 * time + z, 161.31 + -z );

    vec3 ditherValue = texture2D( ditheringTexture, coord ).rgb;

    ditherValue = ditherValue * 2.0 - 1.0;
    ditherValue = sign( ditherValue ) * ( 1.0 - sqrt( 1.0 - abs( ditherValue ) ) );

    value += ditheringAmount * ditherValue;

    return value;
}

void main() {
    //vec4 texel = texture2D( tDiffuse, vUv );
    vec2 position = vUv * size;
    float n = getNoise( vec3( position.xy, z ), frequency, 1.0, offset );


    float threshold = 1.0;

    n = pow( n, power );
    if( n > threshold ) {
        n = threshold - ( n - threshold );
    }

    float uniformNoiseFactor = 0.1;
    n += uniformNoiseFactor * random( position + vec2( z + 112.3 * time, z - 34.1 * time ) ) - uniformNoiseFactor / 2.0;

    vec4 color = mix( color1, color2, n );

    color = vec4(
        dither( color.rgb ).rgb,
        //color.rgb,
        color.a
    );

    //vec4 color = vec4( 1.0, 1.0, 1.0, n );
    gl_FragColor = opacity * color;
}
