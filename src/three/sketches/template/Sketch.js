import * as THREE from 'three';
import { AnimationLoop } from '../../systems/loop/AnimationLoop';
import { Resizer } from '../../systems/resize/Resizer'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'

class Sketch {
    constructor() {
        this.far = 50;
        this.near = 0.1;
        this.backgroundColor = 0x455444;
        this.useSRGB = false;
    }    

    _createRenderer( canvas ) {
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            powerPreference: 'high-performance'
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
        this.initialized = false;

        this.canvas = canvas;
        this.scene = this._createScene();
        this.renderer = this._createRenderer( canvas );
        this.camera = this._createCamera( canvas );
        this.controls = this._createControls( this.camera, canvas );

        this.loop = new AnimationLoop();
        this.resizer = new Resizer( this.canvas, this.camera, this.renderer );

        this._populateScene();

        this.initialized = true;
        callback && callback();
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
        cube.update = ( delta, now ) => {
            cube.rotation.x += delta * 0.1;
            cube.rotation.y += -delta * 0.3;
        };

        // CREATE LIGHT
        const light = new THREE.DirectionalLight(
            '#ffffff',
            1
        );
        light.position.set(5, 5, 5);

        // ADD TO SCENE
        this.scene.add(
            cube,
            light
        );
    }

    start() {
        if( !this.initialized ) return;

        this.loop.start( ( delta, now ) => {
            this._update( delta, now );            
            this._render( delta, now );
        });
    }

    _update( delta, now ) {
        this.scene.traverse( object => {
            if( typeof object.update === "function" ) {
                object.update( delta, now );
            }
        });

        this.controls.update();
    }

    _render( delta, now ) {
        this.renderer.render( this.scene, this.camera );
    }

    stop() {
        if( !this.initialized ) return;
        this.loop.stop();
    }

    handleResize() {
        if( !this.initialized ) return;
        this.resizer.resize();
    }
}

const sketch = new Sketch();

export default sketch;