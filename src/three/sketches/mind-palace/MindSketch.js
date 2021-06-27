import * as THREE from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass.js';

import { toTubeWireframeGeometry } from '../../utils/geometry/tubeWireframeGeometry';

import { guiHelpers } from '../../systems/debug/guiHelpers';
import { Sketch } from '../template/Sketch';
import { OrbPointLight } from '../../components/light/OrbPointLight';

let COLORS = {
    ambient: 0x112215,
    sky: 0x665532,
    ground: 0x332211,

    blue: 0x334499,
    red: 0xa74eb5,
    yellow: 0x553300,
};

class MindSketch extends Sketch {
    constructor() {
        super();

        this.near = 0.01;
        this.far = 50;
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
            focus: 1,
            aperture: 0.0015,
            maxblur: 1.0
        });

        const ssaaPass = new SSAARenderPass( scene, camera );

        const composer = new EffectComposer( renderer );
        composer.addPass( renderPass );
        composer.addPass( ssaaPass );
        composer.addPass( bokehPass );
        composer.addPass( bloomPass );

        return composer;
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


    _createDiamond() {
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

        const material = new THREE.MeshStandardMaterial({
            color: 'white',
            metalness: 0.5,
            roughness: 0.9
        });
        const mesh = new THREE.Mesh( geometry, material );

        //TODO https://threejs.org/docs/#api/en/cameras/CubeCamera
        //TODO create environment map for diamond! 

        const diamond = new THREE.Object3D();
        diamond.add( mesh );
        diamond.update = (delta, time) => {
            diamond.rotation.y += delta * 0.5;
        };
        diamond.scale.y = 2.5;

        return diamond;
    }

    _createOrb() {
        const geometry = 
            //new THREE.EdgesGeometry(
                new THREE.SphereBufferGeometry(2.2, 6, 6);
             //   0 
            //);


        const material = new THREE.MeshStandardMaterial({
            color: 'white',
            emissive: COLORS.yellow,
            emissiveIntensity: 1.5,
        });

        const mesh = new THREE.Mesh(
            toTubeWireframeGeometry( geometry, {
                edgeMode: 'sphere',
                radius: 0.03,
                tubularSegments: 5,
                radialSegments: 5,
                tubeMode: 'visible'
            }),
            material
        );

        const orb = new THREE.Object3D();
        orb.update = ( delta, now ) => {
            orb.rotation.y += -delta * 0.1;
        };
        orb.add( mesh );

        return orb;
    }

    _createFigure() {
        const figure = new THREE.Object3D();

        figure.add(
            this._createDiamond(),
            this._createOrb(),
        );

        return figure;
    }

    _populateScene() {
        this.renderer.toneMapping = THREE.LinearToneMapping;

        this.gui.add( { exposure: 1.0 }, 'exposure', 0.1, 2.0 )
        .onChange( value => { this.renderer.toneMappingExposure = Math.pow( value, 4.0 ) } );

        this.scene.background = new THREE.Color(COLORS.ambient);
        this.scene.fog = new THREE.FogExp2( COLORS.ambient, 0.2 );

        this.renderer.setClearColor( COLORS.ambient );

        this.composer = this._createComposer( this.scene, this.camera, this.renderer );

        const figure = this._createFigure();
        const lights = this._createLights();

        this.scene.add(
            figure,
            lights
        );
    }
}

const mindSketch = new MindSketch();
export default mindSketch;