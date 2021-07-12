// Credit to https://threejs.org/examples/webgl_postprocessing_crossfade.html

var TransitionShader = {

	uniforms: {

		'tDiffuse1':   { type: 't', value: null },
		'tDiffuse2':   { type: 't', value: null },
        'mixRatio':    { type: 'f', value: 0.0 },
        'threshold':   { type: 'f', value: 0.1 },
        'useTexture':  { type: 'i', value: 1 },
        'tMixTexture': { type: 't', value: null },
		'opacity':     { value: 1.0 }

	},

	vertexShader: /* glsl */`
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

	fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse1;
        uniform sampler2D tDiffuse2;
        uniform sampler2D tMixTexture;

        uniform int useTexture;
        uniform float mixRatio;
        uniform float threshold;

		uniform float opacity;

		varying vec2 vUv;

		void main() {
            vec4 texel1 = texture2D( tDiffuse1, vUv );
            vec4 texel2 = texture2D( tDiffuse2, vUv );

            if( useTexture == 1 ) {
                float transition = texture2D( tMixTexture, vUv ).r;
                
                float r = mixRatio * ( 1.0 + threshold * 2.0 ) - threshold;
                float mixAmount = clamp( ( transition - r ) * ( 1.0 / threshold), 0.0, 1.0 );

                gl_FragColor = mix( texel1, texel2, mixAmount );
                //gl_FragColor = mix( texel2, vec4(0.0, 0.0, 0.0, 0.0), mixAmount );
            } else {
                gl_FragColor = mix( texel2, texel1, mixRatio );
            }
		}`

};

export { TransitionShader };