import * as THREE from 'three';
import { Vector4 } from 'three';
import { LayerShader } from '../../shaders/layer/LayerShader';
import { ASSETHANDLER } from '../../systems/assets/AssetHandler';

import { Sketch } from "../template/Sketch";

import ditheringTexturePath from '../../../assets/noise/blue/LDR_RGBA_7.png';

class LayersSketch extends Sketch {

    constructor() {
        super();

        this.backgroundColor = new THREE.Color( 0x000000 );

        this.far = 1000;
    }

    _createRenderer( canvas ) {
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
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
        //TODO expose all relevant parameters to gui
        //TODO create object/class for cube thingy

        const planeGeometry = new THREE.PlaneBufferGeometry( 1, 1 );

        const planeMaterial = new THREE.ShaderMaterial( 
            LayerShader
        );


        const size = 400;
        const planeWidth = size;
        const planeHeight = size;

        const numberOfPlanes = 10;
        const planeOffsets = size / numberOfPlanes;

        const xyFrequency = 0.01;
        const zFrequency = 0.3;
        const zStart = -( numberOfPlanes * planeOffsets ) / 2;

        this.camera.position.z = -zStart - 1.0;

        const randomVectorColor = ( alpha ) => {
            const color = new THREE.Color().setHSL(
                Math.random(),
                1.0 * Math.random(),
                Math.random() * 0.4 + 0.3
            );

            return new Vector4(
                color.r,
                color.g,
                color.b,
                alpha
            );
        };

        for( let i = 0; i < numberOfPlanes; i++ ) {
            const material = planeMaterial.clone();

            material.blending = THREE.AdditiveBlending;
            material.side = THREE.DoubleSide;

            material.uniforms.opacity.value = 1.0;
            material.uniforms.size.value = new THREE.Vector2( planeWidth, planeHeight );
            //material.uniforms.frequency.value = 0.03 + i * 0.01;
            material.uniforms.frequency.value = xyFrequency;
            material.transparent = true;

            material.uniforms.power.value = 3.2;

            material.uniforms.color1.value = randomVectorColor( 0.0 );
            material.uniforms.color2.value = randomVectorColor( 1.0 );

            ASSETHANDLER.loadTexture( ditheringTexturePath, false, ( texture ) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;

                material.uniforms.hasDitheringTexture.value = true;
                material.uniforms.ditheringTexture.value = texture;
                material.uniforms.ditheringTextureDimensions.value = new THREE.Vector2( texture.image.width, texture.image.height );
            } );

            const plane = new THREE.Mesh( planeGeometry, material );

            const z = i * planeOffsets + zStart;
            plane.position.z = z;
            material.uniforms[ 'z' ].value = zFrequency * z;

            plane.scale.set( planeWidth, planeHeight, 1 );

            plane.animationUpdate = ( delta, now ) => {
                material.uniforms.offset.value.z += delta * 0.5;
                material.uniforms.time.value = now;
            };

            this.scene.add( plane );
        }

    }
}

const sketch = new LayersSketch();

export default sketch;
