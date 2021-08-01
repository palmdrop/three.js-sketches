import * as THREE from 'three';

import vertexShader from './shapeMorphShader.vert';
import fragmentShader from './shapeMorphShader.frag';

const ShapeMorphShader = {

    uniforms: {
        'opacity': { value: 1.0 },
        'viewDirection': { value: new THREE.Vector3( 0, 0, 1 ) },
        'eyePosition': { value: new THREE.Vector3( 0, 0, 0 ) },

        'time': { value: 0.0 },
    },

    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
}

export { ShapeMorphShader };