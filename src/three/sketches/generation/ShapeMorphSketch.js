import * as THREE from 'three';
import { ShapeMorphShader } from '../../shaders/shapeMorph/ShapeMorphShader';

import { Sketch } from "../template/Sketch";

//import backgroundTexturePath from '../../../assets/images/bleaves.png';
//import backgroundTexturePath from '../../../assets/images/pond.png';
import backgroundTexturePath from '../../../assets/images/grass.png';
//import backgroundTexturePath from '../../../assets/images/night-tree.png';
import { ASSETHANDLER } from '../../systems/assets/AssetHandler';

import { guiHelpers } from '../../systems/debug/guiHelpers';

class ShapeMorphSketch extends Sketch {

    constructor() {
        super();

        this.backgroundColor = 'black';
    }    

    _createRenderer( canvas ) {
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            powerPreference: 'high-performance',
            alpha: false
        });

        // COLOR AND LIGHTING
        if( this.useSRGB ) renderer.outputEncoding = THREE.sRGBEncoding;

        // enable the physically correct lighting model
        renderer.physicallyCorrectLights = true;

        return renderer;
    };


    _populateScene() {
        const backgroundTexture = ASSETHANDLER.loadTexture( backgroundTexturePath );
        backgroundTexture.wrapS = THREE.MirroredRepeatWrapping;
        backgroundTexture.wrapT = THREE.MirroredRepeatWrapping;

        this.scene.background = backgroundTexture;

        //TODO add rotation to noise warp, create sphere with rotating swirl effect

        //TODO warp light passing through object! custom blending?
        //TODO caustics?

        //TODO good colors: 
        //  1) 0x823737
        //  2) 0x106be8

        const cubeSize = 10;

        const geometry = 
            //new THREE.BoxGeometry( 1.0, 1.0, 1.0 );
            new THREE.SphereBufferGeometry( 0.5, 100, 100, 100 );
            //new THREE.SphereBufferGeometry( 1, 20, 20 );
        const material = new THREE.ShaderMaterial( ShapeMorphShader );

        material.blending = THREE.NormalBlending;
        material.transparent = true;
        material.opacity = 1.0;

        material.uniforms.tBackground.value = this.scene.background;
        material.uniforms.hasBackgroundTexture.value = true;

        material.uniforms.lights.value = [
            {
                position: new THREE.Vector3( 10, 10, 10 ),
                color: new THREE.Color( 'white' ),
                intensity: 1.1,
                decay: 0.3
            },
            {
                position: new THREE.Vector3( -10, -10, -10 ),
                color: new THREE.Color( 'white' ),
                intensity: 1.1,
                decay: 0.3
            }
        ];
        material.uniforms.numberOfLights.value = 2;

        const addLightSliders = ( lightName, light ) => {
            const folder = this.gui.addFolder( lightName );

            guiHelpers.vector( folder, light, 'position' );
            guiHelpers.color( folder, light, 'color' );
            folder.add( light, 'intensity', 0, 10 );
            folder.add( light, 'decay', 0, 10 );
        };

        addLightSliders( "light1", material.uniforms.lights.value[ 0 ] );
        addLightSliders( "light2", material.uniforms.lights.value[ 1 ] );

            //material.uniforms.pointLights.value.length;


        this.material = material;

        /*for( let i = 0; i < 10; i++ ) {
            const mesh = new THREE.Mesh( geometry, material );
            mesh.scale.set( cubeSize, cubeSize, cubeSize / 10 );

            mesh.position.z = i * 1.1;

            this.scene.add( mesh );
        }*/
        const mesh = new THREE.Mesh( geometry, material );
        mesh.scale.set( cubeSize, cubeSize, cubeSize );
        this.scene.add( mesh );
        


        this.bounds = new THREE.Box3( 
            new THREE.Vector3( -cubeSize / 2, -cubeSize / 2, -cubeSize / 2 ), 
            new THREE.Vector3( cubeSize, cubeSize, cubeSize ) 
        );


        this.camera.position.z = cubeSize + 5;

        // Add sliders for uniforms
        const addSlider = ( uniformName, min, max ) => {
            const uniform = this.material.uniforms[ uniformName ];

            this.gui.add( { [uniformName]: uniform.value }, uniformName, min, max )
            .onChange( ( value ) => {
                uniform.value = value;
            });
        };

        const addColor = ( uniformName ) => {
            const uniform = this.material.uniforms[ uniformName ];

            this.gui.addColor( { [uniformName]: uniform.value.getHex() }, uniformName )
            .onChange( ( value ) => {
                uniform.value.set( value );
            });
        };

        addSlider( 'steps', 1, 100 );
        addSlider( 'stepSizeMultiplier', 0.01, 100 );
        addSlider( 'frequency', 0.001, 1 );
        addSlider( 'falloff', 0.001, 1.5 );

        addSlider( 'contrast', 0.01, 10 );

        addSlider( 'warpOffset', 0.1, 10 );
        addSlider( 'warpAmount', 0.1, 10 );
        addSlider( 'backgroundWarpScale', 0.1, 200 );

        addColor( 'color1' );
        addColor( 'color2' );

        addSlider( 'brightness', 0.1, 10 );
        addSlider( 'alphaScale', 0.1, 10 );
        addSlider( 'alphaContrast', 0.1, 10 );

        addSlider( 'staticAmount', 0.0, 0.5 );

        addSlider( 'blurSize', 0.0, 10 );

    }

    _update( delta, now ) {
        super._update( delta, now );

        this.camera.getWorldDirection(
            this.material.uniforms.viewDirection.value
        );

        this.material.uniforms.eyePosition.value = this.camera.position;
        this.material.uniforms.time.value = now;

        /*if( this.bounds.containsPoint( this.camera.position ) ) {
            this.material.side = THREE.BackSide;
        } else {
            this.material.side = THREE.FrontSide;
        }*/
    }

    handleResize() {
        super.handleResize();

        if( !this.initialized ) return;

        this.material.uniforms.viewportSize.value.set(
            this.canvas.width,
            this.canvas.height
        );
    }
}

const sketch = new ShapeMorphSketch();
export default sketch;