import * as THREE from 'three';

import vertexShader from './shapeMorphShader.vert';
import fragmentShader from './shapeMorphShader.frag';

const ShapeMorphShader = {

    uniforms: {
        'tBackground': { value: null },
        'hasBackgroundTexture': { value: false },

        'opacity': { value: 1.0 },
        'viewDirection': { value: new THREE.Vector3( 0, 0, 1 ) },
        'eyePosition': { value: new THREE.Vector3( 0, 0, 0 ) },
        'viewportSize': { value: new THREE.Vector2( 1, 1 ) },

        'steps': { value: 33 },
        'stepSizeMultiplier': { value: 10 },
        'frequency': { value: 0.26 },
        'falloff': { value: 0.86 },

        'contrast': { value: 3.8},

        'warpOffset': { value: 10.0 },
        'warpAmount': { value: 2.8 },
        'backgroundWarpScale': { value: 67.0 },

        'color1': { value: new THREE.Color( 0xaf443e ) },
        'color2': { value: new THREE.Color( 0x5dc863 ) },

        'brightness': { value: 2.0 },
        'alphaScale': { value: 1.4 },
        'alphaContrast': { value: 4.0 },

        'staticAmount': { value: 0.011 },

        'blurSize': { value: 3.4 },

        'time': { value: 0.0 },

        'numberOfLights': { value: 0 },
        'pointLights': { value: [] },
    },

    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
}

export { ShapeMorphShader };