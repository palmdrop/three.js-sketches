import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { UnrealBloomPass, UnrealBloompass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

export class FeedbackRenderer {
    constructor( renderer, shader ) {

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(
            -1, 1, -1, 1, 
            0, 10000
        );

        const renderTarget = new THREE.WebGLRenderTarget( 1.0, 1.0, {
        });

        const composer = new EffectComposer( renderer, renderTarget );
        const renderPass = new RenderPass( scene, camera );
        const shaderPass = new ShaderPass( shader );
        const bloomPass = new UnrealBloomPass( 
            new THREE.Vector2( 1.0, 1.0 )
            , 0.105, 0.0, 0.75 
        );

        this.shaderPass = shaderPass;

        composer.addPass( renderPass );
        composer.addPass( shaderPass );
        //composer.addPass( bloomPass );
        composer.renderToScreen = false;

        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.renderTarget = renderTarget;
        this.composer = composer;

        this._populateScene();
    }

    _populateScene() {
        const quadGeometry = new THREE.PlaneBufferGeometry( 1, 1 );
        const quadMaterial = new THREE.MeshBasicMaterial( {
            map: this.renderTarget.texture
        });

        const quad = new THREE.Mesh( quadGeometry, quadMaterial );
        quad.position.set( 0, 0, -1000 );

        const cube = new THREE.Mesh(
            new THREE.BoxBufferGeometry( 1.0, 1.0, 1.0 ),
            //new THREE.MeshBasicMaterial( { color: 'red' } )
            new THREE.MeshStandardMaterial( {
                color: new THREE.Color( 0x3377ff ),
            })
        );
        cube.scale.set( 100, 100, 100 );
        cube.position.set( 0, 0, -200 );

        cube.animationUpdate = ( delta, now ) => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
        };

        const directionalLight = new THREE.DirectionalLight( 'white', 20 );
        const ambientLight = new THREE.AmbientLight( 'white', 1.0 );
        
        this.scene.add(
            quad,
            cube,
            directionalLight,
            ambientLight
        );

        this.quad = quad;

        this.setSize();
    }

    setSize( width, height ) {
        if( !width || !height ) {
            const dimensions = this.renderer.getSize( new THREE.Vector2() );
            width = dimensions.x;
            height = dimensions.y;
        }

        this.renderTarget.setSize( width, height );
        this.composer.setSize( width, height );

        const camera = this.camera;

        camera.left   = -width  / 2;
        camera.right  =  width  / 2;
        camera.top    =  height / 2;
        camera.bottom = -height / 2;
        camera.updateProjectionMatrix();

        this.quad.scale.set( width, height, 1.0 );
        
        this.shaderPass.uniforms.viewportSize.value.set( width, height );
    }

    render( delta, now ) {
        this.shaderPass.uniforms.time.value = now;

        this.composer.render( delta );
        this.composer.swapBuffers();

        this.scene.traverse( object => {
            if( typeof object.animationUpdate === 'function' ) {
                object.animationUpdate( delta, now );
            }
        });
    }

    /*render( renderTarget ) {
        this.composer.render();
    }*/
}