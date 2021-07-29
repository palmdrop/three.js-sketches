import * as THREE from 'three';

import { Sketch } from "../template/Sketch";

class LayersSketch extends Sketch {

    constructor() {
        super();
    }

    _createRenderer( canvas ) {
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: false,
            powerPreference: 'high-performance',
            alpha: false
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

    _populateScene() {
        //TODO experiment with different blending function

        const planeGeometry = new THREE.PlaneBufferGeometry( 1, 1 );

        const planeMaterial = new THREE.MeshBasicMaterial( {
            color: 'white',
            transparent: true,
            opacity: 0.3,
        });

        const planeWidth = 8;
        const planeHeight = 4;

        const numberOfPlanes = 3;
        const planeOffsets = 2;

        const zStart = -( numberOfPlanes * planeOffsets ) / 2;
        for( let i = 0; i < numberOfPlanes; i++ ) {
            const plane = new THREE.Mesh( planeGeometry, planeMaterial );

            const z = i * planeOffsets + zStart;
            plane.position.z = z;

            plane.scale.set( planeWidth, planeHeight, 1 );

            this.scene.add( plane );
        }

    }
}

const sketch = new LayersSketch();

export default sketch;
