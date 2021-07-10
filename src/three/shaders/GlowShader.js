// Inspired by https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/Shader-Glow.html

import * as THREE from "three";

var GlowShader = {

	uniforms: {
        'amount': { type: 'f', value: 0.01 },
        'softness': { type: 'f', value: 0.8 },
        'glowColor': { type: 'c', value: new THREE.Color(0xffffff) },
        'viewVector': { type: 'v3', value: new THREE.Vector3(0, 0, 0) },
        'opacity': { value: 1.0 }
	},

	vertexShader: /* glsl */`
        uniform vec3 viewVector;
        uniform float amount;
        uniform float softness;
        varying float intensity;

		void main() {

            vec3 surfaceNormal = normalize( normalMatrix * normal );
            vec3 viewNormal = normalize( normalMatrix * viewVector );
            intensity = pow( amount - dot( surfaceNormal, viewNormal ), softness );

            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

	fragmentShader: /* glsl */`
        uniform vec3 glowColor;
        uniform float opacity;
        varying float intensity;

		void main() {
            //gl_FragColor = opacity * vec4( glowColor * intensity, 1.0 );
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
		}`

};

export { GlowShader };
