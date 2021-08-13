import * as THREE from 'three';

import vertexShader from './feedbackShader.vert';
import fragmentShader from './feedbackShader.frag';

const FeedbackShader = {
	uniforms: {

		'tDiffuse': { value: null },
		'viewportSize': { value: new THREE.Vector2() },
		'time': { value: 0.0 },
		'opacity': { value: 1.0 },

		'offsetAmount': { value: 0.15 },
		'speed': { value: 0.04 },
		'blurSize': { value: 2.0},
		'frequency': { value: 10.0 },
		'staticAmount': { value: 0.01 },
		'colorMorphAmount': { value: 0.2 },
		'colorMorphFrequency': { value: 12.0 },
		'rgbOffset': { value: 0.01 },

		'contrast': { value: 1.0 },
		'brightness': { value: 1.0 },
	},
	vertexShader: vertexShader,
	fragmentShader: fragmentShader

};

export { FeedbackShader };