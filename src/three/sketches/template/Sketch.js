import * as THREE from 'three';
import * as dat from 'dat.gui';

import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'

import { AnimationLoop } from '../../systems/loop/AnimationLoop';
import { Resizer } from '../../systems/resize/Resizer'
import { ASSETHANDLER } from '../../systems/assets/AssetHandler';

class Sketch {
    constructor() {
        this.far = 50;
        this.near = 0.1;
        this.backgroundColor = 0x455444;
        this.useSRGB = false;

        this.paused = false;
        this.initialized = false;
        this.loaded = false;

        this.waitForLoad = false;
        this.shouldStart = false;

        this.updateables = [];
    }    

    _createRenderer( canvas ) {
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: false,
            powerPreference: 'high-performance',
            alpha: true
        });

        // SHADOWS
        //renderer.shadowMap.enabled = true;
        //renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // COLOR AND LIGHTING
        if( this.useSRGB ) renderer.outputEncoding = THREE.sRGBEncoding;

        // enable the physically correct lighting model
        renderer.physicallyCorrectLights = true;

        return renderer;
    };

    _createScene() {
        const scene = new THREE.Scene();

        scene.background = new THREE.Color( this.backgroundColor );
        if( this.useSRGB ) scene.background.convertSRGBToLinear();

        scene.fog = new THREE.Fog(
            this.backgroundColor, 
            this.near,            
            this.far              
        );

        return scene;
    };

    _createCamera( canvas ) {
        const camera = new THREE.PerspectiveCamera(
            75,                           // fov
            canvas.width / canvas.height, // aspect 
            this.near,                    // near
            this.far,                     // far
        );
        camera.position.set(0, 0, 5);

        return camera;
    };

    _createControls( camera, canvas ) {
        const controls = new TrackballControls(
            camera,
            canvas
        );

        controls.rotationSpeed = 4;
        controls.dynamicDampingFactor = 0.15;

        return controls;
    }

    initialize( canvas, callback ) {

        this.canvas = canvas;
        this.scene = this._createScene();
        this.renderer = this._createRenderer( canvas );
        this.camera = this._createCamera( canvas );
        this.controls = this._createControls( this.camera, canvas );

        this.loop = new AnimationLoop();
        this.resizer = new Resizer( this.canvas, this.camera, this.renderer );

        this.gui = new dat.GUI();

        this._populateScene();

        this.initialized = true;

        ASSETHANDLER.onLoad( null, () => {
            this.loaded = true;
            if( this.shouldStart ) {
                this.start();
            }
            callback && callback();
        });


        this.scene.traverse( object => {
            if( typeof object.animationUpdate === "function" ) {
                this.updateables.push( object );
            }
        });
    }

    _populateScene() {
        // CREATE CUBE
        const geometry = new THREE.BoxBufferGeometry(
            2, 2, 2, // Dimensions
            2, 2, 2  // Segments
        );

        const material = new THREE.MeshStandardMaterial({
            color: '#448833',
            metalness: 0.0,
            roughness: 0.3
        });
        material.dithering = true;

        const cube = new THREE.Mesh( geometry, material );
        cube.animationUpdate = ( delta, now ) => {
            cube.rotation.x += delta * 0.1;
            cube.rotation.y += -delta * 0.3;
        };

        // CREATE LIGHT
        const directionalLight = new THREE.DirectionalLight(
            '#ffffff',
            2
        );
        directionalLight.position.set(2, 2, 2);

        const ambientLight = new THREE.AmbientLight(
            '#ffffff',
            0.2,
        );

        // GUI
        const cubeFolder = this.gui.addFolder("Cube");
        cubeFolder.add(cube.scale, 'x', 0, 5, 0.01);
        cubeFolder.add(cube.scale, 'y', 0, 5, 0.01);
        cubeFolder.add(cube.scale, 'z', 0, 5, 0.01);

        const materialFolder = cubeFolder.addFolder("Material");
        materialFolder.add(material, 'metalness', 0, 1.0, 0.01);
        materialFolder.add(material, 'roughness', 0, 1.0, 0.01);

        const lightFolder = this.gui.addFolder("Light");
        lightFolder.add(directionalLight, 'intensity', 0, 5, 0.01);
        lightFolder.add(directionalLight.position, 'x', -5, 5, 0.01);
        lightFolder.add(directionalLight.position, 'y', -5, 5, 0.01);
        lightFolder.add(directionalLight.position, 'z', -5, 5, 0.01);

        this.gui.add(this, 'paused', 0, 1, 1.0);

        // ADD TO SCENE
        this.scene.add(
            cube,
            directionalLight,
            ambientLight
        );
    }

    start() {
        //if( !this.initialized ) return;
        if( !this.initialized || (this.waitForLoad && !this.loaded) ) {
            this.shouldStart = true;
            return;
        }

        this.loop.start( ( delta, now ) => {
            this._update( delta, now );            
            this._render( delta, now );
        });
    }

    _update( delta, now ) {
        if( this.controls ) this.controls.update();

        if( this.paused ) return;

        /*this.scene.traverse( object => {
            if( typeof object.animationUpdate === "function" ) {
                object.animationUpdate( delta, now );
            }
        });*/
        this.updateables.forEach( object => {
            object.animationUpdate( delta, now );
        });

    }

    _render( delta, now ) {
        if( this.composer ) {
            this.composer.render( delta );
        } else {
            this.renderer.render( this.scene, this.camera );
        }
    }

    stop() {
        this.shouldStart = false;
        if( !this.initialized ) return;
        this.loop.stop();
    }

    cleanup() {
        this.gui.destroy();
    }

    handleResize() {
        if( !this.initialized ) return;
        this.resizer.resize( [ this.composer ] );
    }
}

const sketch = new Sketch();

export { Sketch };

export default sketch;