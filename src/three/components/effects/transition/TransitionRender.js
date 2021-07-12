import * as THREE from 'three';

import { TransitionShader } from '../../../shaders/TransitionShader';

export class TransitionRender {
    constructor( texture1, texture2, transitionTexture, threshold, renderer ) {
        // Initialize fields
        this.texture1 = texture1;
        this.texture2 = texture2;
        this.renderer = renderer;

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);

        const quadMaterial = new THREE.ShaderMaterial( TransitionShader );
        const quadGeometry = new THREE.PlaneGeometry( 1.0, 1.0 );
        this.quadMaterial = quadMaterial;
        this.quad = new THREE.Mesh( quadGeometry, quadMaterial );

        this.scene.add( this.quad );

        // Update size 
        const size = renderer.getSize( new THREE.Vector2() );
        this.setSize( size.x, size.y );

        // Set uniforms
        quadMaterial.uniforms[ 'tDiffuse1' ].value = texture1;
        quadMaterial.uniforms[ 'tDiffuse2' ].value = texture2;
        quadMaterial.uniforms[ 'threshold' ].value = threshold;

        if( transitionTexture ) {
            quadMaterial.uniforms[ 'useTexture' ].value = 1;
            quadMaterial.uniforms[ 'tMixTexture' ].value = transitionTexture;
        } else {
            quadMaterial.uniforms[ 'useTexture' ].value = 0;
        }
    }

    setSize( width, height ) {
        this.camera.left = -width / 2;
        this.camera.right = width / 2;
        this.camera.top = height / 2;
        this.camera.bottom = -height / 2;
        this.camera.updateProjectionMatrix();

        this.quad.scale.set( width, height );
    }

    render( mix ) {
        this.quadMaterial.uniforms[ 'mixRatio' ].value = mix;
        this.renderer.render( this.scene, this.camera );
    }
}