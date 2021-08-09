import * as THREE from 'three';

import vertexShader from './feedbackShader.vert';
import fragmentShader from './feedbackShader.frag';

const FeedbackShader = {
	uniforms: {

		'tDiffuse': { value: null },
		'viewportSize': { value: new THREE.Vector2() },
		'time': { value: 0.0 },
		'opacity': { value: 1.0 }

	},
	vertexShader: vertexShader,
	fragmentShader: fragmentShader

};

export { FeedbackShader };