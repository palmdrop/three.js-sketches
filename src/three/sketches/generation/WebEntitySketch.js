import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import { makeNoise3D } from 'fast-simplex-noise';

import { Sketch } from "../template/Sketch";

import { PointVolume } from '../../components/generation/points/PointVolume';
import { SpaceColonizationTree } from '../../components/generation/space-colonization/SpaceColonizationTree';
import { random, randomUnitVector3, remap } from '../../utils/Utils';

import { ASSETHANDLER } from '../../systems/assets/AssetHandler';

import circleTexturePath from '../../../assets/sprites/circle.png';
import treeTexturePath from '../../../assets/textures/ridges1.png';

class WebEntitySketch extends Sketch {
    constructor() {
        super();
    }

    _createRenderer( canvas ) {
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: false,
            powerPreference: 'high-performance',
            alpha: true,
            preserveDrawingBuffer: true
        });

        // SHADOWS
        //renderer.shadowMap.enabled = true;
        //renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // COLOR AND LIGHTING
        if( this.useSRGB ) renderer.outputEncoding = THREE.sRGBEncoding;

        // enable the physically correct lighting model
        renderer.physicallyCorrectLights = true;

        renderer.autoClearColor = false;
        //renderer.autoClearDepth = false;

        return renderer;
    }

    _populateScene() {
        this._initializePostprocessing();

        const noise = makeNoise3D();

        const pointVolume = new PointVolume( {
            numberOfPoints: 1000,
            maxNumberOfTries: 10000,

            generationMethod: 'function',
            threshold: 0.3,
            probabilityFunction: ( point ) => {
                return noise( 0.2 * point.x, 0.2 * point.y, 0.2 * point.z );
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

        //this.scene.fog = null;

        //const directionalLight = new THREE.DirectionalLight( 'white', 5 );
        //directionalLight.position.set( 0, 10, 10 );
        for( let i = 0; i < 3; i++ ) {
            const pointLight = new THREE.PointLight( 
                new THREE.Color().setHSL(
                    Math.random(),
                    0.3,
                    0.5
                ),
                20, 20, 2 
            );

            pointLight.position.set( 
                random(-3, 3),
                random(-3, 3),
                random(-3, 3),
            );
            this.scene.add( pointLight );
        }


        const tree = new SpaceColonizationTree( 
            0.2, // Min dist
            3,   // Max dist
            0.7, // Dynamics
            0.10, // Step size
            0.00  // Random deviation
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
                return 1.3 * Math.PI * Math.pow( remap( child.reverseDepth, 1, maxDepth, 0, 1.0), 1.0 );
            }
        );

        const treeObject = new THREE.Object3D();
        const treeMaterial = new THREE.MeshStandardMaterial( { 
            color: '#664423',

            bumpMap: ASSETHANDLER.loadTexture( treeTexturePath ),
            bumpScale: 0.01,

            metalness: 0.5,
            roughness: 0.0
        });

        this.scene.add( tree.buildThreeObject( treeMaterial, 0.1 ) );

        this.gui.destroy();
    }

    _initializePostprocessing() {
        this.composer = new EffectComposer( this.renderer );
        //this.composer.addPass( new SSAARenderPass( this.scene, this.camera ));
        this.composer.addPass( new RenderPass( this.scene, this.camera ) );

        const bloomParams = {
            strength: {
                value: 1.9,
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

        //guiHelpers.arbitraryObject( this.gui, bloomParams, bloomPass, 'bloom' );

        this.composer.addPass( bloomPass );

        //this.composer.renderToScreen = false;
        this.composer.renderToScreen = true;
    }
}

const webEntitySketch = new WebEntitySketch();
export default webEntitySketch;