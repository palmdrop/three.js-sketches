#pragma glslify: simplex3d = require(glsl-noise/simplex/3d);

uniform float opacity;
uniform sampler2D tDiffuse;
uniform vec2 viewportSize;
uniform float time;

varying vec2 vUv;

float getNoise( vec3 position, vec3 frequency, float amplitude, vec3 offset ) {
    vec3 samplePosition = position * frequency + offset;

    float result = simplex3d( samplePosition );
    result = 0.5 + result / 2.0;

    return amplitude * result;
}

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

vec3 addStatic( vec3 color, vec2 vUv, float amount ) {
    float rn = random( vUv + vec2( -1.0, 1.0 ) );
    float gn = random( vUv + vec2( 1.0, -1.0 ) );
    float bn = random( vUv + vec2( 1.0, 1.0 ) );

    return vec3( 
        color.r + amount * rn - amount / 2.0,
        color.g + amount * gn - amount / 2.0,
        color.b + amount * bn - amount / 2.0
    );
}

vec4 rgbShift( sampler2D textureImage, vec2 uv, vec2 rOffset, vec2 gOffset, vec2 bOffset ) {
    vec4 sr = texture2D( textureImage, uv + rOffset );
    vec4 sg = texture2D( textureImage, uv + gOffset );
    vec4 sb = texture2D( textureImage, uv + bOffset );
    return vec4( sr.r, sg.g, sb.b, sr.a );
}

vec3 colorMorph( vec3 color, vec2 uv, float time, float frequency, float amount ) {
    float rn = getNoise( vec3( uv,  time * 0.91),  vec3( frequency ), amount, vec3( 0.0 ) ) - amount / 2.0;
    float gn = getNoise( vec3( uv, -time ),        vec3( frequency ), amount, vec3( 0.0 ) ) - amount / 2.0;
    float bn = getNoise( vec3( uv,  time * 1.31 ), vec3( frequency ), amount, vec3( 0.0 ) ) - amount / 2.0;

    color.r += ( color.r * rn );
    color.g += ( color.g * gn );
    color.b += ( color.b * bn );

    return color;
}


void main() {
    float offsetAmount = 0.15;
    float speed = 0.04;
    float blurSize = 2.0;
    float frequency = 10.0;
    float staticAmount = 0.01;

    float colorMorphAmount = 0.2;

    float rgbOffset = 0.01;

    //TODO think about possible "jittering" or division effects!
    //TODO how can I make the movements more divided, //// |||| [[[[]]]] occasionally?


    //TODO use color to alter blur amount, offset, etc

    vec2 offset = vec2(
        // X
        getNoise( 
            vec3( vUv,  speed * time ),         
            vec3( frequency ), 
            offsetAmount, 
            vec3( 0.0 )) 
        - offsetAmount / 2.0,

        // Y
        getNoise( 
            vec3( vUv, -speed * time - 10.0 ), 
            vec3( frequency ), 
            offsetAmount, 
            vec3( 0.0 )) 
        - offsetAmount / 2.0 
    );

    vec2 uv = vUv + offset;

    vec4 previous = texture2D( tDiffuse, uv );
    vec4 t = rgbShift( tDiffuse, uv, 
        vec2( previous.r * rgbOffset, 0.0 ),
        vec2( 0.0, previous.g * rgbOffset ),
        vec2( 0.0, previous.b * -rgbOffset )
    );

    //vec4 texel = blur( tDiffuse, vUv + offset, t.b * 2.0 );
    vec4 texel = t;

    vec3 color = addStatic( texel.rgb, vUv + vec2( time, -time ), staticAmount );

    color = colorMorph( color, uv, time, frequency / 3.0, colorMorphAmount );

    gl_FragColor = vec4( ( previous.rgb + color ) / 2.0, 1.0 );
}