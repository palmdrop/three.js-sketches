import * as THREE from 'three';

import vertexShader from './layerShader.vert';
import fragmentShader from './layerShader.frag';

var LayerShader = {

	uniforms: {
		'tDiffuse': { value: null },
		'opacity': { value: 1.0 },

		'time': { value: 0.0 },

		'size': { value: new THREE.Vector2( 10, 5 ) },
		'z': { value: 0.0 },
		'offset': { value: new THREE.Vector3() },

		'frequency': { value: 1.0 },
		'power': { value: 1.0 },

		'color1': { value: new THREE.Vector4( 1.0, 1.0, 1.0, 0.0 ) },
		'color2': { value: new THREE.Vector4( 1.0, 1.0, 1.0, 1.0 ) },

		'ditheringAmount': { value: 0.5 },
		'hasDitheringTexture': { value: false },
		'ditheringTexture': { value: null },
		'ditheringTextureDimensions': { value: new THREE.Vector2() },

	},

	vertexShader: vertexShader,
	fragmentShader: fragmentShader
};

export { LayerShader };