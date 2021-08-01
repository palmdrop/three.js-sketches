#pragma glslify: simplex3d = require(glsl-noise/simplex/3d);

uniform float opacity;

uniform vec3 viewDirection;
uniform vec3 eyePosition;

uniform float time;

varying vec2 vUv;
varying vec4 worldPosition;

void main() {
    int steps = 30;
    float stepSize = 10.0 / float( steps );
    float frequency = 0.1;

    vec3 eyeToFragment = worldPosition.xyz - eyePosition;
    vec3 direction = normalize( eyeToFragment.xyz );
    //vec3 direction = viewDirection;


    float falloff = 0.9;
    float divider = 0.0;

    //TODO change color based on "distance" to viewer
    //TODO determine how FAST the value increases

    //TODO use accumulated sample value to determine alpha/threshold
    //TODO use speed of change (weighted using falloff) to determine hue?
    float value = 0.0;
    float weightedValue = 0.0;

    for( int i = 0; i < steps; i++ ) {
        float weight = pow( falloff, float( i ) );
        divider += weight;

        vec3 samplePosition = worldPosition.xyz + 
            direction * ( float( i ) * stepSize )
            //+ vec3( 1.0 * time, 0.0, 0.0 );
            ;

        float xOffset = 0.5 + simplex3d( frequency * samplePosition + vec3( 5.0, 0.0, 0.0 )) / 2.0; 
        float yOffset = 0.5 + simplex3d( frequency * samplePosition + vec3( 0.0, 5.0, 0.0 )) / 2.0; 
        float zOffset = 0.5 + simplex3d( frequency * samplePosition + vec3( 0.0, 0.0, 5.0 )) / 2.0; 

        float n = 0.5 + simplex3d( frequency * samplePosition + 5.0 * vec3( xOffset, yOffset, zOffset )) / 2.0; 
        //float n = simplex3d( frequency * samplePosition ); 

        //value += weight * pow( n, 2.0 );
        value += n;
        weightedValue += weight * n;
    }

    //value /= ( divider / float( steps ) );
    //value /= ( divider ); //float( steps );

    value /= float( steps );
    weightedValue /= divider;

    //vec4 color = vec4( normalize(abs(eyeToFragment.xyz)), 1.0);
    vec3 color;

    /*if( value > 0.1 ) {
        color = vec4( 1.0, 1.0, 1.0, 1.0 );
    } else {
        color = vec4( 0.0, 0.0, 0.0, 1.0 );
    }*/

    color = mix(
        vec3( 0.0, 1.0, 0.0 ),
        vec3( 1.0, 0.0, 0.0 ),
        1.0 - pow( weightedValue, 0.9 ) );

    //color = vec4( 1.0, 1.0, 1.0, value );

    gl_FragColor = opacity * vec4( color, pow( 2.0 * value, 2.0 ) );
}