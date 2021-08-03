import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import { guiHelpers } from '../../systems/debug/guiHelpers';

import { makeNoise3D } from 'fast-simplex-noise';

import { Sketch } from "../template/Sketch";

import { PointVolume } from '../../components/generation/points/PointVolume';
import { SpaceColonizationTree } from '../../components/generation/space-colonization/SpaceColonizationTree';
import { random, randomUnitVector3, remap } from '../../utils/Utils';

import { ASSETHANDLER } from '../../systems/assets/AssetHandler';

import circleTexturePath from '../../../assets/sprites/circle.png';
import treeTexturePath from '../../../assets/textures/ridges1.png';
import backgroundPath from '../../../assets/images/bleaves.png';
import environmentMapPath from '../../../assets/hdr/trees_night_hq.hdr';

class WebEntitySketch extends Sketch {
    constructor() {
        super();

        //TODO render without pp to transparent canvas! then apply background and pp

    }

    handleResize() {
        if( !this.initialized ) return;
        this.canvas.width = window.innerWidth * 2;
        this.canvas.height = window.innerHeight * 2;
        this.resizer.resize( [ this.composer ] );

        //this.scene.background = this.background;
    }

    _createRenderer( canvas ) {
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: false,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true,
            alpha: true
        });

        // COLOR AND LIGHTING
        if( this.useSRGB ) renderer.outputEncoding = THREE.sRGBEncoding;

        // enable the physically correct lighting model
        renderer.physicallyCorrectLights = true;

        renderer.autoClearColor = false;
        //renderer.autoClearDepth = false;

        return renderer;
    }

    _populateScene() {
        const ambientColor = new THREE.Color().setHSL(
            Math.random(),
            0.3,
            0.4
        );

        //this.renderer.setClearColor( ambientColor );
        this.scene.background = 'transparent';
        this.renderer.setClearColor( new THREE.Color( 0x00000000 ) );
        this.renderer.setClearAlpha( 0 );

        this._initializePostprocessing();

        const noise = makeNoise3D();

        const pointVolume = new PointVolume( {
            numberOfPoints: 1000,
            maxNumberOfTries: 10000,

            generationMethod: 'function',
            threshold: 0.5,
            probabilityFunction: ( point ) => {
                return noise( 0.25 * point.x, 0.25 * point.y, 0.25 * point.z );
            }
        })

        /*const geometry = new THREE.SphereGeometry( 0.1, 5, 5 );*/

        /*const material = new THREE.MeshBasicMaterial( {
            color: 'white',
        })*/

        const data = [];
        const points = new THREE.Group();
        points.visible = false;

        this.gui.add( points, 'visible' );

        pointVolume.points.forEach( point => {
            const material = new THREE.SpriteMaterial( {
                map: ASSETHANDLER.loadTexture( circleTexturePath ),
                color: 'white',
            });
            const pointSprite = new THREE.Sprite( material );
            pointSprite.position.copy( point );
            pointSprite.scale.set( 0.2, 0.2, 1.0 );

            data.push( pointSprite );
            points.add( pointSprite );
        });
        this.scene.add( points );

        ASSETHANDLER.loadHDR( this.renderer, environmentMapPath, envMap => {
            //this.scene.environment = envMap;
        });

        //this.background = ambientColor;
        //ASSETHANDLER.loadTexture( backgroundPath );
        //this.scene.background = this.background;

        //this.scene.fog = new THREE.Fog( ambientColor, 25, 0.1 );
        //this.scene.fog = new THREE.Fog( ambientColor, 0.1, 25 );

        //const directionalLight = new THREE.DirectionalLight( 'white', 5 );
        //directionalLight.position.set( 0, 10, 10 );

        const ambientLight = new THREE.AmbientLight( 'white', 0.1 );
        this.scene.add( ambientLight );

        for( let i = 0; i < 3; i++ ) {
            const pointLight = new THREE.PointLight( 
                new THREE.Color().setHSL(
                    Math.random(),
                    0.3,
                    0.5
                ),
                5, 25, 2 
            );

            pointLight.position.set( 
                random(-3, 3),
                random(-3, 3),
                random(-3, 3),
            );

            this.scene.add( pointLight );
        }

        const directionalLight = new THREE.DirectionalLight( ambientColor, 5 );
        this.scene.add( directionalLight );

        const tree = new SpaceColonizationTree( 
            //0.2, // Min dist
            ( position ) => { return noise( 0.05 * position.x, 0.05 * position.y, 0.05 * position.z ) * 0.1 + 0.1 },
            2,   // Max dist
            0.7, // Dynamics
            0.05, // Step size
            ( position ) => { return noise( 0.1 * position.x, 0.1 * position.y, 0.1 * position.z ) * 0.02 + 0.0 },
            //0.00  // Random deviation
        );

        tree.generate( 
            pointVolume.points, 
            pointVolume.volume, 
            new THREE.Vector3(), 
            randomUnitVector3(),
            200
        );

        tree.toSkeleton(
            ( child, maxDepth ) => {
                return 1.5 * Math.PI * Math.pow( remap( child.reverseDepth, 1, maxDepth, 0.1, 1.0), 1.0 );
            }
        );

        const treeMaterial = new THREE.MeshStandardMaterial( { 
            //color: '#664423',

            //bumpMap: ASSETHANDLER.loadTexture( treeTexturePath ),
            //bumpScale: 0.01,

            envMapIntensity: 1.0,

            metalness: 0.0,
            roughness: 0.0,

            roughnessMap: ASSETHANDLER.loadTexture( treeTexturePath ),
            
        });

        const treeObject = tree.buildThreeObject( 
            treeMaterial, 
            0.001,
            0.05,
            0.1, 
            3 
        );

        treeObject.animationUpdate = ( delta, now ) => {
            //treeObject.rotation.x += delta * 1.5;
            //treeObject.rotation.y += -delta * 1.8;
            //treeObject.rotation.z += delta * 1.0;
            
        }
        
        this.scene.add( treeObject );

        this.gui.add( this.scene.fog, 'near' );
        this.gui.add( this.scene.fog, 'far' );

        //this.gui.destroy();

        this.renderer.clear();

    }

    _initializePostprocessing() {
        this.postProcessingRenderTarget = new THREE.WebGLRenderTarget( this.canvas.width, this.canvas.height, {
            format: THREE.RGBAFormat,
        });

        //this.composer = new EffectComposer( this.renderer, this.postProcessingRenderTarget );
        this.composer = new EffectComposer( this.renderer );
        //this.composer.addPass( new SSAARenderPass( this.scene, this.camera ));
        this.composer.addPass( new RenderPass( this.scene, this.camera ) );

        const bloomParams = {
            strength: {
                value: 1.5,
                min: 0.0,
                max: 5.0
            },
            threshold: {
                value: 0.4,
                min: 0,
                max: 1.0,
            },
            radius: {
                value: 1,
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

        //this.composer.addPass( bloomPass );

        //this.composer.renderToScreen = false;
        //this.composer.renderToScreen = true;
    }

    _render() {

        super._render();
        //this.scene.background = null;


    }
}

const webEntitySketch = new WebEntitySketch();
export default webEntitySketch;