import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import { Sketch } from '../template/Sketch';
import { guiHelpers } from '../../systems/debug/guiHelpers';

import { ParallaxVolume } from '../../components/effects/atmosphere/ParallaxVolume';
import { CloudVolume } from '../../components/effects/atmosphere/CloudVolume';
import { toTubeWireframeGeometry } from '../../utils/geometry/tubeWireframeGeometry';

import { TransitionRender } from '../../components/effects/transition/TransitionRender';

import { ASSETHANDLER } from '../../systems/assets/AssetHandler';
import { forEachChild } from '../../utils/Utils';

import i1 from '../../../assets/images/trees/trees1.png';
import i2 from '../../../assets/images/trees/trees2.png';
import i3 from '../../../assets/images/trees/trees3.png';

import lensflarePath1 from '../../../assets/textures/flares/lensflare0_alpha.png';
import lensflarePath2 from '../../../assets/textures/flares/lensflare3.png';

import environmentMapPath from '../../../assets/hdr/trees_night_hq.hdr';
//import environmentMapPath from '../../../assets/hdr/night2.hdr';
//import backgroundTexturePath from '../../../assets/textures/stars/stars2.png';
import diamondTexturePath from '../../../assets/textures/whirl4.png';
import transitionTexturePath from '../../../assets/textures/whirl1.png';

class ParallaxSketch extends Sketch {
    constructor() {
        super();

        this.backgroundColor = 0x101305;
        this.waitForLoad = true;
        this.tweens = [];

        this.rotationSpeed = 0.1;

        this.transitionMix = 0.0;
        this.transitionThreshold = 0.1;
    }

    initialize( canvas, callback ) {
        super.initialize( canvas, () => {

            this.tweens.forEach( tween => {
                tween.start();
            });

            callback && callback();
        });
    }

    _createMainLightFlare( color, opacity ) {
        const mainTextureFlare = ASSETHANDLER.loadTexture( lensflarePath1 );
        const mainFlareMaterial = new THREE.SpriteMaterial( {
            color: color,
            map: mainTextureFlare,
            transparent: true,
            opacity: opacity
        });

        return new THREE.Sprite( mainFlareMaterial );
    }

    _populateScene() {
        this.controls = null;
        this.renderer.setClearColor('#000000');
        this.renderer.toneMapping = THREE.LinearToneMapping;
        this.renderer.antialias = false;

        this.gui.add( { exposure: 1.0 }, 'exposure', 0.1, 2.0 )
        .onChange( value => { this.renderer.toneMappingExposure = Math.pow( value, 4.0 ) } );

        // PARALLAX EFFECT
        const parallaxVolume = new ParallaxVolume( {
            instances: 20,
            instanceScale: 10,
            instanceScaleVariation: 0.2,
            layers: 5,
            opacity: 1.0,

            color: '#ffdfff',

            volume: {
                x: -17.5,
                y: -4.5,
                z: -13,

                w: 35,
                h: 15,
                d: 10,
            },

            images: [
                i1,
                i2,
                i3,
                //i4,
            ],

            parallaxSpeed: {
                min: -0.1,
                max: 0.3
            },

            materialOpts: {
                bumpScale: 0.03,
                metalness: 0.1,
                roughness: 0.5,
            },

            placeEvenly: true,
            placementVariation: 0.15,

            mirroredAmount: 0.5,
        } );

        // LIGHTING
        const ambientLight = new THREE.AmbientLight(
            '#ffffff',
            0.2
        );

        const pointLight = new THREE.PointLight(
            '#99585e',
            10.0,
            100,
            1
        );

        pointLight.position.set( 0, 0, -2 );

        const lightFlare = this._createMainLightFlare( '#ffffff', 0.7 );
        lightFlare.scale.set( 20, 20, 1 );

        pointLight.add( lightFlare );

        // Background
        ASSETHANDLER.loadHDR( this.renderer, environmentMapPath, ( envMap ) => {
            this.scene.background = envMap;
            this.scene.environment = envMap;
        });
        //this.scene.background = ASSETHANDLER.loadTexture( backgroundTexturePath );

        const [ cubeRenderTarget, cubeCamera ] = this._createCubeCamera();
        this.cubeCamera = cubeCamera;

        // ICON
        this.icon = this._createMindPalaceIcon( cubeRenderTarget );

        // Add to scene
        this.scene.add(
            parallaxVolume,
            ambientLight,
            pointLight,
            cubeCamera,
            this.icon
        );

        this._createSimpleRender();

        this._initializeEffects();

        this._initializePostprocessing();

        this._initializeAnimation();

        this.transitionRender = new TransitionRender( 
            //this.shaderRender.renderTarget.texture, 
            this.simpleRenderTarget.texture,
            this.renderTarget.texture, 
            ASSETHANDLER.loadTexture( transitionTexturePath ),
            this.transitionThreshold,
            this.renderer
        );

        this.gui.add( this, 'transitionMix', 0.0, 1.0 );
        this.gui.add( this, 'transitionThreshold', 0.0, 1.0 )
        .onChange( () => {
            this.transitionRender.quadMaterial.uniforms[ 'threshold' ].value = this.transitionThreshold;
        });

    }

    _createSimpleRender() {
        const simpleScene = new THREE.Scene();
        simpleScene.background = new THREE.Color( '#113025')
        const icon = this.simpleIcon;

        const material = new THREE.MeshBasicMaterial( {
            color: '#012015'
        });

        forEachChild( icon, ( child ) => {
            if( child.material ) child.material = material;
        });

        simpleScene.add( icon );

        this.simpleScene = simpleScene;

        //const shaderRender = new ShaderRender( this.renderer, basicScene, this.camera, FadeOutShader );
        this.simpleRenderTarget = new THREE.WebGLRenderTarget( this.canvas.clientWidth, this.canvas.clientHeight );
    }

    _createMindPalaceIcon( environmentMapRenderTarget ) {
        const diamondRadius = 0.85;
        const diamondStretch = 2.0;

        const sphereRadius = 0.15;

        const spacing = 0.15;

        const sphereColor = '#ff8f9f';

        // Load texture
        const diamondTexture = ASSETHANDLER.loadTexture( diamondTexturePath );

        // Create diamond
        const diamondGeometry = new THREE.OctahedronBufferGeometry( diamondRadius );
        diamondGeometry.applyMatrix4(
            new THREE.Matrix4().scale( new THREE.Vector3( 1.0, diamondStretch, 1.0 ) )
        );

        const diamondMaterial = new THREE.MeshStandardMaterial( { 
            color: '#ffffff',

            bumpMap: diamondTexture,
            bumpScale: 0.02,

            roughnessMap: diamondTexture,

            roughness: 0.0,
            metalness: 0.5,

            envMap: environmentMapRenderTarget.texture
        });

        const diamondMesh = new THREE.Mesh( diamondGeometry, diamondMaterial );
        //diamondMesh.scale.y = diamondStretch;

        // Create diamond border
        const diamondBorderGeometry = toTubeWireframeGeometry(
            new THREE.EdgesGeometry( diamondGeometry, 70 ), {
                edgeMode: 'sphere',
                radius: 0.017,
                tubularSegments: 1,
                radialSegments: 15,
                tubeMode: 'visible'
            }
        );

        const diamondBorderMaterial = new THREE.MeshBasicMaterial( {
            //emissive: '#864433',
            //emissiveIntensity: 1.4,
            color: '#ffddbb'
        });

        const diamondBorder = new THREE.Mesh( diamondBorderGeometry, diamondBorderMaterial );
        diamondBorder.scale.y = 1.5;


        const diamond = new THREE.Group();
        diamond.renderOrder = 0;
        diamond.add( diamondMesh, diamondBorder );
        //diamond.add( diamondMesh );

        //diamond.position.set( 0, 0.5, 1 );

        diamond.rotation.y = -Math.PI;

        diamond.animationUpdate = ( delta, now ) => {
            const rotation = this.diamond.rotation.y;
            const amountLeft = Math.PI / 4 - rotation;
            this.rotationSpeed = amountLeft / 2.0;

            if( amountLeft < 0.05 ) {
                this.done = true;
            }

            diamond.rotation.y += delta * this.rotationSpeed;
        };

        this.diamond = diamond;

        // Create sphere
        const sphereGeometry = new THREE.SphereBufferGeometry( sphereRadius, 30, 30 );
        const sphereMaterial = new THREE.MeshStandardMaterial( {
            color: sphereColor,
            emissive: sphereColor,

            roughness: 0.5,
            metalness: 0.7,
        });

        const sphereMesh = new THREE.Mesh( sphereGeometry, sphereMaterial );

        const sphereLight = new THREE.PointLight( sphereColor, 40, 5, 2 );
        this.flareLight = sphereLight;

        const sphere = new THREE.Group();
        sphere.add( sphereMesh, sphereLight );

        sphere.position.set( 
            0,
            -( diamondRadius * diamondStretch ) - sphereRadius - spacing,
            0
        );

        const icon = new THREE.Group();
        icon.position.set( 0, 0.5, 1 );

        icon.add( diamond, sphere );

        this.simpleIcon = new THREE.Group();
        this.simpleIcon.position.copy( icon.position );
        this.simpleIcon.add( diamondMesh.clone(), sphere.clone( true ) );
        this.simpleIcon.rotation.y = Math.PI / 4;
        /*this.simpleIcon.animationUpdate = ( delta, now ) => {
            this.simpleIcon.rotation.y += delta * this.rotationSpeed;
        };*/

        return icon;
    }

    _initializeEffects() {
        // Lens flare
        const light = this.flareLight;
        
        const mainTextureFlare = ASSETHANDLER.loadTexture( lensflarePath1 );
        const secondaryTextureFlare = ASSETHANDLER.loadTexture( lensflarePath2 );

        const lensflare = new Lensflare();
        //lensflare.addElement( new LensflareElement( mainTextureFlare, 800, 0, light.color ) );
        lensflare.addElement( new LensflareElement( secondaryTextureFlare, 80, 0.4 ) );
        lensflare.addElement( new LensflareElement( secondaryTextureFlare, 70, 0.5 ) );
        lensflare.addElement( new LensflareElement( secondaryTextureFlare, 60, 0.8 ) );

        light.add( lensflare );

        // Billboard for main light flare effect
        const lightFlare = this._createMainLightFlare( light.color, 0.6 );
        lightFlare.scale.set( 3, 3, 1.0 );

        light.add( lightFlare );

        // Smoke
        const smoke = new CloudVolume( {
            textureOpacity: 0.1,

            instances: 10,
            instanceSize: 20,

            rotationSpeed: {
                min: -0.1,
                max: 0.1
            },

            camera: this.camera,
            useSprites: false,
            faceCamera: false,
        });

        smoke.position.set( 0, 2, 1 );

        this.scene.add( smoke );
    }

    _createCubeCamera() {
        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 128 * 2, {
            format: THREE.RGBFormat,
            generateMipmaps: true,
            minFilter: THREE.LinearMipMapLinearFilter
        });

        const cubeCamera = new THREE.CubeCamera( 1, 10000, cubeRenderTarget );

        return [ cubeRenderTarget, cubeCamera ];
    }

    _initializePostprocessing() {
        this.renderTarget = new THREE.WebGLRenderTarget( this.canvas.clientWidth, this.canvas.clientHeight, {
        });

        this.composer = new EffectComposer( this.renderer, this.renderTarget );
        this.composer.addPass( new SSAARenderPass( this.scene, this.camera ));
        //this.composer.addPass( new RenderPass( this.scene, this.camera ));

        const bloomParams = {
            strength: {
                value: 0.9,
                min: 0.0,
                max: 5.0
            },
            threshold: {
                value: 0.4,
                min: 0,
                max: 1.0,
            },
            radius: {
                value: 0,
                min: 0,
                max: 1
            }
        };

        const bloomPass = new UnrealBloomPass( new THREE.Vector2( this.canvas.clientWidth, this.canvas.clientHeight ), 
            bloomParams.strength.value,
            bloomParams.radius.value,
            bloomParams.threshold.value,
        );

        guiHelpers.arbitraryObject( this.gui, bloomParams, bloomPass, 'bloom' );

        this.composer.addPass( bloomPass );

        this.composer.renderToScreen = false;

    }

    _initializeAnimation() {
        // Camera tweens
        {
            // Pan down (xy) tween
            const xy = { x: 0.0, y: 7.0 };
            const intermediateXY = { x: 0.0, y: 1.5 };
            const finalXY = { x: 0.0, y: 0.5 };

            const time1 = 2300;
            const time2 = 3000;

            const onUpdateXY = () => {
                this.camera.position.x = xy.x;
                this.camera.position.y = xy.y;
            }

            const xyTween = 
                // Tween 1 (from start to midpoint)
                new TWEEN.Tween( xy )
                .to( intermediateXY, time1 )
                .easing( TWEEN.Easing.Cubic.In )
                .onUpdate( onUpdateXY )

                // Tween 2 (from midpoint to end)
                .chain( new TWEEN.Tween( xy )
                .to( finalXY, time2 )
                .easing( TWEEN.Easing.Elastic.Out )
                .onUpdate( onUpdateXY ));

            // Zoom tween
            const z = { z: 3 };
            const finalZ = { z: 5.5 };

            const onUpdateZ = () => {
                this.camera.position.z = z.z;
            };

            const zTween = 
                new TWEEN.Tween( z )
                .to( finalZ, time1 + time2 )
                .easing( TWEEN.Easing.Cubic.InOut )
                .onUpdate( onUpdateZ );

            // Add tweens to tweens array
            this.tweens.push(
                xyTween,
                zTween
            );

        }

        //this.cubeCamera.update( this.renderer, this.scene );
    }

    _render( delta ) {
        super._render( delta );
        this.renderer.setRenderTarget( this.simpleRenderTarget );
        this.renderer.render( this.simpleScene, this.camera );

        this.composer.swapBuffers();

        this.renderer.setRenderTarget( null );
        this.transitionRender.render( this.transitionMix );
    }

    _update( delta, now ) {
        super._update( delta, now );
        this.cubeCamera.update( this.renderer, this.scene );

        TWEEN.update();

    }

    handleResize() {
        if( !this.initialized ) return;
        this.resizer.resize( [ this.composer, this.simpleRenderTarget, this.transitionRender ] );
    }
}

const parallaxSketch = new ParallaxSketch();
export default parallaxSketch;