import * as THREE from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass';

import { toTubeWireframeGeometry } from '../../utils/geometry/tubeWireframeGeometry';

import { guiHelpers } from '../../systems/debug/guiHelpers';
import { Sketch } from '../template/Sketch';
import { OrbPointLight } from '../../components/light/OrbPointLight';
import { ASSETHANDLER } from '../../systems/assets/AssetHandler';

import { CloudVolume } from '../../components/effects/atmosphere/CloudVolume';

import diamondtexturePath from '../../../assets/textures/ridges1.png';
import backgroundTexturePath from '../../../assets/images/woods1.png';

import environmentMapPath from '../../../assets/hdr/trees_night.hdr';

let COLORS = {
    ambient: 0x112215,
    sky: 0x665532,
    ground: 0x332211,

    blue: 0x334499,
    red: 0xa74eb5,
    yellow: 0x553300,

    glow: 0xe33463 
};

class MindSketch extends Sketch {
    constructor() {
        super();

        this.near = 0.01;
        this.far = 50;

        this.waitForLoad = true;
    };

    _createComposer( scene, camera, renderer ) {
        const renderPass = new RenderPass( scene, camera );

        const bloomParams = {
            strength: {
                value: 1.0,
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
                max: 10
            }
        };

        const bloomPass = new UnrealBloomPass( new THREE.Vector2( this.canvas.clientWidth, this.canvas.clientHeight ), 
            bloomParams.strength.value,
            bloomParams.radius.value,
            bloomParams.threshold.value,
        );

        guiHelpers.arbitraryObject( this.gui, bloomParams, bloomPass, 'bloom' );

        const bokehPass = new BokehPass( scene, camera, {
            focus: 0.8,
            aperture: 0.004,
            maxblur: 1.0
        });

        const ssaaPass = new SSAARenderPass( scene, camera );

        const afterimagePass = new AfterimagePass( 0.7 );

        //TODO try video feedback render using texture pass to screen
        const texturePass = new TexturePass( ASSETHANDLER.loadTexture( backgroundTexturePath ), 0.3 );

        const composer = new EffectComposer( renderer );
        composer.addPass( renderPass );
        composer.addPass( ssaaPass );
        composer.addPass( bloomPass );
        composer.addPass( bokehPass );
        //composer.addPass( afterimagePass );

        return composer;
        //return null;
    }

    _createLights() {
        const ambient = new THREE.AmbientLight(
            COLORS.ambient,
            2 
        );

        const hemisphere = new THREE.HemisphereLight(
            COLORS.sky,
            COLORS.ground,
            1
        );

        /*const point1 = new THREE.PointLight(
            COLORS.blue, // Color
            70,           // Intensity
            10,          // Distance
            2            // Decay
        );*/

        const point1 = new OrbPointLight({
            color: COLORS.blue,
            intensity: 22,
            distance: 10,
            decay: 2,
            glow: 10.5,
            segments: 8,
            radius: 0.05,
            opacity: 1.0
        });

        point1.position.set( 2, 2, 0 );
        //guiHelpers.pointLight(this.gui, point1.light, 'point1');
        guiHelpers.orbPointLight( this.gui, point1, 'point1' );

        const point2 = new OrbPointLight({
            color: COLORS.red,
            intensity: 22,
            distance: 10,
            decay: 2,
            glow: 10.5,
            segments: 8,
            radius: 0.05,
            opacity: 1.0
        });

        point2.position.set( -2, -2, 0 );
        //guiHelpers.pointLight(this.gui, point2.light, 'point2');
        guiHelpers.orbPointLight( this.gui, point2, 'point2' );

        const lights = new THREE.Group();


        lights.add( 
            ambient,
            hemisphere,
            point1,
            point2,
        );


        return lights;
    }


    _createDiamond( envMapTarget ) {
        const size = 1;
        const geometry = new THREE.BoxBufferGeometry(
            size, size, size,
            1, 1, 1
        );
        geometry.applyMatrix4(
            new THREE.Matrix4().makeRotationX( Math.PI / 4 )
        );
        geometry.applyMatrix4(
            new THREE.Matrix4().makeRotationZ( Math.PI / 5.6 )
        );

        const texture = ASSETHANDLER.loadTexture( diamondtexturePath );

        const material = new THREE.MeshStandardMaterial({
            color: 'white',
            metalness: 1.0,
            roughness: 0.0,

            bumpMap: texture,
            bumpScale: 0.03,

            envMap: envMapTarget.texture,
            envMapIntensity: 1.0,
        });

        const mesh = new THREE.Mesh( geometry, material );

        const diamond = new THREE.Object3D();
        diamond.add( mesh );
        diamond.animationUpdate = (delta, time) => {
            diamond.rotation.y += delta * 0.2;
        };
        diamond.scale.y = 2.5;

        return diamond;
    }

    _createOrb() {
        const geometry = 
             //new THREE.EdgesGeometry(
                new THREE.SphereBufferGeometry(2.2, 7, 7);
                //10 
            //);

        const texture = ASSETHANDLER.loadTexture( diamondtexturePath );

        const material = new THREE.MeshStandardMaterial({
            color: 'white',
            emissive: COLORS.glow,
            emissiveIntensity: 2.5,

            metalness: 1.0,
            roughness: 0.0,

            bumpMap: texture,
            bumpScale: 0.00
        });

        const mesh = new THREE.Mesh(
            toTubeWireframeGeometry( geometry, {
                edgeMode: 'sphere',
                radius: 0.02,
                tubularSegments: 2,
                radialSegments: 4,
                tubeMode: 'visible'
            }),
            material
        );

        const orb = new THREE.Object3D();
        orb.animationUpdate = ( delta, now ) => {
            orb.rotation.y += -delta * 0.05;
        };
        orb.add( mesh );

        return orb;
    }

    _createFigure( envMapTarget ) {
        const figure = new THREE.Object3D();

        figure.add(
            this._createDiamond( envMapTarget ),
            this._createOrb(),
        );

        return figure;
    }

    _createEnvironmentalEffects() {
        const clouds = new CloudVolume({ 
            instances: 25,
            instanceSize: 10,

            textureOpacity: 0.1,

            volume: {
                x: -5,
                y: -5,
                z: -5,

                w: 10,
                h: 10,
                d: 10,
            },

            rotationSpeed: {
                min: -0.3,
                max:  0.3
            },

            camera: this.camera,
            useSprites: false,
        });

        const effects = new THREE.Group();
        effects.add(
            clouds
        );

        return effects;
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

    _populateScene() {
        this.renderer.setClearColor( COLORS.ambient );
        this.renderer.toneMapping = THREE.LinearToneMapping;
        //TODO use sRGB enconding

        this.gui.add( { exposure: 1.0 }, 'exposure', 0.1, 2.0 )
        .onChange( value => { this.renderer.toneMappingExposure = Math.pow( value, 4.0 ) } );

        this.scene.background = new THREE.Color( COLORS.ambient );
        this.scene.fog = new THREE.FogExp2( COLORS.ambient, 0.1 );
        ASSETHANDLER.loadHDR( this.renderer, environmentMapPath, ( envMap ) => {
            this.scene.background = envMap;
            this.scene.environment = envMap;
        });

        const [ cubeRenderTarget, cubeCamera ] = this._createCubeCamera();
        this.cubeCamera = cubeCamera;

        this.composer = this._createComposer( this.scene, this.camera, this.renderer );

        const figure = this._createFigure( cubeRenderTarget );
        const lights = this._createLights();
        const effects = this._createEnvironmentalEffects();

        this.scene.add(
            figure,
            lights,
            effects,
            cubeCamera
        );
    }

    _update( delta, now ) {
        super._update( delta, now );
        this.cubeCamera.update( this.renderer, this.scene );
    }
}

const mindSketch = new MindSketch();
export default mindSketch;