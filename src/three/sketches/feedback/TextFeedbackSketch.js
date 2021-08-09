import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';

import { FeedbackRenderer } from "../../components/feedback/FeedbackRenderer";
import { createFullScreenTextureRenderer, FullscreenQuadRenderer } from "../../components/render/FullscreenQuadRenderer";
import { FeedbackShader } from "../../shaders/feedback/FeedbackShader";
import { Sketch } from "../template/Sketch";

class TextFeedbackSketch extends Sketch {
    constructor() {
        super();

        /* TODO
            * Background plane that covers entire screen
            * Orthographic camera that watches the plane 
                * camera view is rendered to plane
                * post processing effects
            * 3D/2D elements can be overlayed on top of plane
                * either using orthographic camera
                * or using player camera (perspective) (Could be cool effect)
                * elements can be blended (add,mult,sub) in various ways
            * plane can be rendered as background in main scene

            * scenes:
                1) main, player scene (start with just orthographic camera, no movement?)
                2) orthographic plane rendering scene
        */

    }

    _populateScene() {
        //super._populateScene();

        // CREATE RENDER TARGET AND COMPOSER FOR SCREEN
        /*const renderTarget = new THREE.WebGLRenderTarget( 1.0, 1.0, {
        });

        const composer = new EffectComposer( this.renderer, renderTarget );
        const renderPass = new RenderPass( this.scene, this.camera );
        const shaderPass = new ShaderPass( FeedbackShader );
        
        //TODO use copypass if not working!
        composer.addPass( renderPass );
        composer.addPass( shaderPass );
        composer.renderToScreen = false;

        composer.setSize( this.canvas.width, this.canvas.height );

        this.renderTarget = renderTarget;
        this.composer = composer;

        // CREATE QUAD*/

        const feedbackRenderer = new FeedbackRenderer( this.renderer, FeedbackShader );
        feedbackRenderer.scene.background = new THREE.Color( 'black' );
        this.feedbackRenderer = feedbackRenderer;


        const quadGeometry = new THREE.PlaneBufferGeometry( 1, 1 );
        const quadMaterial = new THREE.MeshBasicMaterial( {
            //color: 'red',
            //map: this.renderTarget.texture
            map: this.feedbackRenderer.renderTarget.texture
        });

        const quad = new THREE.Mesh( quadGeometry, quadMaterial );
        quad.scale.set( 20, 20, 1.0 );
        quad.position.set( 0, 0, -10 );
        
        this.scene.add(
            quad
        );
    }

    _render( delta, now ) {
        //this.composer.render( delta );
        //this.composer.swapBuffers();
        this.feedbackRenderer.render( delta, now );

        this.renderer.setRenderTarget( null );
        this.renderer.render( this.scene, this.camera );
    }

    /*_populateScene() {
        this.feedbackRenderer = new FeedbackRenderer( this.renderer, FeedbackShader, "tDiffuse" );
        this.fullscreenQuadRender = createFullScreenTextureRenderer(
            this.renderer, 
            this.feedbackRenderer.renderTarget.texture,
            new THREE.WebGLRenderTarget( 1, 1 ),
        );
    }

    _render( delta, now ) {
        this.feedbackRenderer.render();
        this.fullscreenQuadRender.render();
    }*/

    handleResize() {
        if( !this.initialized ) return;

        super.handleResize();
        this.feedbackRenderer.setSize();
    }
}

const sketch = new TextFeedbackSketch();

export default sketch;