import * as THREE from 'three';

import { FeedbackRenderer } from "../../components/feedback/FeedbackRenderer";
import { createFullScreenTextureRenderer, FullscreenQuadRenderer } from "../../components/render/FullscreenQuadRenderer";
import { FeedbackShader } from "../../shaders/feedback/FeedbackShader";
import { Sketch } from "../template/Sketch";

class TextFeedbackSketch extends Sketch {
    constructor() {
        super();
        this.sizeMultiplier = 2.0;

        this.overlayLastUpdateTime  = -1;
        this.overlayUpdateFrequency = 1;
    }

    _renderOverlay() {
        const ctx = this.overlayContext;
        const canvas = ctx.canvas;

        ctx.clearRect( 0, 0, canvas.width, canvas.height );

        ctx.font = '100px serif';
        ctx.fillStyle = '#fff';

        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;

        ctx.fillText( 'CONTENT', x, y );

        ctx.fill();
    }

    _populateScene() {
        const ctx = document.createElement('canvas').getContext('2d');
        
        ctx.canvas.width = 1;
        ctx.canvas.height = 1;

        const overlay = new THREE.CanvasTexture(
            ctx.canvas,
            THREE.MirroredRepeatWrapping,
            THREE.MirroredRepeatWrapping,
        );
        this.overlayContext = ctx;
        this.overlay = overlay;

        this._renderOverlay();

        const feedbackRenderer = new FeedbackRenderer( this.renderer, FeedbackShader, overlay );
        feedbackRenderer.scene.background = new THREE.Color( 'black' );
        feedbackRenderer.addGUI( this.gui );
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
        if( ( now - this.overlayLastUpdateTime ) > this.overlayUpdateFrequency ) {
            this.overlay.needsUpdate = true;
            this._renderOverlay();

            this.overlayLastUpdateTime = now;
        }


        this.feedbackRenderer.render( delta, now );

        //this.renderer.setRenderTarget( null );
        //this.renderer.render( this.scene, this.camera );
        this.feedbackRenderer.render( delta, now, true );

        if( this.captureNextFrame ) {
            this.captureNextFrame = false;
            this.dataCallback(
                this.canvas.toDataURL("image/png")
            );
        }
    }

    handleResize() {
        if( !this.initialized ) return;
        this.resizer.resize( [ this.composer, this.feedbackRenderer ], this.sizeMultiplier );
        /*super.handleResize();
        this.feedbackRenderer.setSize();*/
        this.overlayContext.canvas.width = this.canvas.width;
        this.overlayContext.canvas.height = this.canvas.height;

        this.overlay.needsUpdate = true;
    }
}

const sketch = new TextFeedbackSketch();

export default sketch;