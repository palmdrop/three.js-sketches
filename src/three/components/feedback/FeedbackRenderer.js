import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader';
import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader';
import { UnrealBloomPass, UnrealBloompass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

export class FeedbackRenderer {
    constructor( renderer, shader, overlay = null, objects = [] ) {

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(
            -1, 1, -1, 1, 
            0, 10000
        );

        const renderTarget = new THREE.WebGLRenderTarget( 1.0, 1.0, {
            wrapS: THREE.MirroredRepeatWrapping,
            wrapT: THREE.MirroredRepeatWrapping,
            type: THREE.FloatType,
        });

        const composer = new EffectComposer( renderer, renderTarget );
        const renderPass = new RenderPass( scene, camera );
        const verticalBlurPass = new ShaderPass( VerticalBlurShader );
        const horizontalBlurPass = new ShaderPass( HorizontalBlurShader );
        const shaderPass = new ShaderPass( shader );
        const bloomPass = new UnrealBloomPass( 
            new THREE.Vector2( 1.0, 1.0 )
            , 0.105, 0.0, 0.75 
        );

        this.shaderPass = shaderPass;
        this.verticalBlurPass = verticalBlurPass;
        this.horizontalBlurPass = horizontalBlurPass;
        this.blurSize = 0.0;

        composer.addPass( renderPass );
        composer.addPass( verticalBlurPass );
        composer.addPass( horizontalBlurPass );
        composer.addPass( shaderPass );
        //composer.addPass( bloomPass );
        composer.renderToScreen = false;

        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.renderTarget = renderTarget;
        this.composer = composer;

        this._populateScene( overlay, objects );
    }

    _populateScene( overlay, objects ) {
        const quadGeometry = new THREE.PlaneBufferGeometry( 1, 1 );
        const quadMaterial = new THREE.MeshBasicMaterial( {
            map: this.renderTarget.texture
        });

        const quad = new THREE.Mesh( quadGeometry, quadMaterial );
        quad.position.set( 0, 0, -1000 );

        if( overlay ) {
            const overlayQuad = new THREE.Mesh( 
                quadGeometry,
                new THREE.MeshBasicMaterial( {
                    map: overlay,
                    transparent: true,
                    blending: THREE.AdditiveBlending,
                })
            );

            overlayQuad.position.set( 0, 0, -999 );

            this.overlayQuad = overlayQuad;
        }

        const cube = new THREE.Mesh(
            new THREE.BoxBufferGeometry( 1.0, 1.0, 1.0 ),
            new THREE.MeshStandardMaterial( {
                color: new THREE.Color( 0x3377ff ),
            })
        );
        cube.scale.set( 200, 200, 200 );
        cube.position.set( 0, 0, -300 );

        cube.rotation.set( 3.0, 6.0, 3.0 );

        cube.animationUpdate = ( delta, now ) => {
            //cube.rotation.x += 0.01;
            //cube.rotation.y += 0.01;
        };

        const directionalLight = new THREE.DirectionalLight( 'white', 20 );
        const ambientLight = new THREE.AmbientLight( 'white', 1.0 );
        
        this.scene.add( quad );
        this.quad = quad;

        const content = new THREE.Group();
        content.add( 
            cube,
            directionalLight,
            ambientLight
        );

        if( overlay ) {
            this.scene.add( this.overlayQuad );
        }

        objects.forEach( object => content.add( object ) );

        this.scene.add( content );
        this.content = content;

        this.setSize();
    }

    addGUI( gui ) {
        // Add GUI sliders
        const addSlider = ( uniformName, min, max ) => {
            const uniform = this.shaderPass.uniforms[ uniformName ];
            gui.add( { [uniformName]: uniform.value }, uniformName, min, max, 0.001 )
            .onChange( value => uniform.value = value );
        }

        addSlider( 'offsetAmount', 0.0, 2.0 );
        addSlider( 'speed', 0.0, 1.0 );
        //addSlider( 'blurSize', 0.0, 3 );

        
        gui.add( { blurSize: 0.0 }, 'blurSize', 0.0, 100 )
        .onChange( blurSize => this._setBlurSize( blurSize ) );

        addSlider( 'frequency', 0.0, 20.0 );
        addSlider( 'staticAmount', 0.0, 0.1 );
        addSlider( 'colorMorphAmount', 0.0, 1.0 );
        addSlider( 'colorMorphFrequency', 0.0, 30.0 );
        addSlider( 'rgbOffset', 0.0, 1.0 );
        addSlider( 'contrast', 0.0, 10.0 );
        addSlider( 'brightness', 0.0, 10.0 );

        gui.add( { contentVisible: true }, 'contentVisible' )
        .onChange( visible => this.content.visible = visible );
    }

    _setBlurSize( blurSize ) {
        this.blurSize = blurSize;
        this.verticalBlurPass.uniforms.v.value = this.blurSize / this.width;
        this.horizontalBlurPass.uniforms.h.value = this.blurSize / this.height;
    }

    setSize( width, height ) {
        if( !width || !height ) {
            const dimensions = this.renderer.getSize( new THREE.Vector2() );
            width = dimensions.x;
            height = dimensions.y;
        }
        this.width = width;
        this.height = height;

        this.renderTarget.setSize( width, height );
        this.composer.setSize( width, height );

        const camera = this.camera;

        camera.left   = -width  / 2;
        camera.right  =  width  / 2;
        camera.top    =  height / 2;
        camera.bottom = -height / 2;
        camera.updateProjectionMatrix();

        this.quad.scale.set( width, height, 1.0 );
        if( this.overlayQuad ) {
            this.overlayQuad.scale.set( width, height, 1.0 );
        }
        
        this.shaderPass.uniforms.viewportSize.value.set( width, height );

        this.verticalBlurPass.uniforms.v.value = this.blurSize / width;
        this.horizontalBlurPass.uniforms.h.value = this.blurSize / height;
    }

    render( delta, now, toScreen = false ) {
        this.shaderPass.uniforms.time.value = now;

        if( toScreen ) {
            this.composer.renderToScreen = true;
            this.composer.render( delta );
            this.composer.swapBuffers();
        } else {
            this.composer.renderToScreen = false;
            this.composer.render( delta );
            this.composer.swapBuffers();
        }

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