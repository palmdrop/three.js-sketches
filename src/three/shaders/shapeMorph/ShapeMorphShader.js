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
        'frequency': { value: 0.23 },
        'falloff': { value: 0.86 },

        'contrast': { value: 2.0 },

        'warpOffset': { value: 10.0 },
        'warpAmount': { value: 2.2 },
        'backgroundWarpScale': { value: 67.0 },

        'color1': { value: new THREE.Color( 0xaf443e ) },
        'color2': { value: new THREE.Color( 0x5dc863 ) },

        'brightness': { value: 1.8 },
        'alphaScale': { value: 1.0 },
        'alphaContrast': { value: 4.5 },

        'staticAmount': { value: 0.015 },

        'blurSize': { value: 3.4 },

        'time': { value: 0.0 },
    },

    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
}

export { ShapeMorphShader };