import * as THREE from 'three';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare';

import { Sketch } from './template/Sketch';
import { guiHelpers } from './../systems/debug/guiHelpers';

import { ParallaxVolume } from '../components/effects/atmosphere/ParallaxVolume';

import { ASSETHANDLER } from './../systems/assets/AssetHandler';

import i1 from '../../assets/images/trees/bush1.png';
import i2 from '../../assets/images/trees/tree1.png';
import i3 from '../../assets/images/trees/tree2.png';
import i4 from '../../assets/images/trees/tree3.png';

import lensflarePath1 from '../../assets/textures/flares/lensflare0_alpha.png';
import lensflarePath2 from '../../assets/textures/flares/lensflare3.png';

class ParallaxSketch extends Sketch {
    constructor() {
        super();
    }

    _populateScene() {
        this.renderer.setClearColor('#000000');

        // Parallax effect
        const parallaxVolume = new ParallaxVolume( {
            instances: 150,
            instanceScale: 6,
            instanceScaleVariation: 0.2,
            layers: 3,
            opacity: 1.0,

            color: '#ffdfff',

            volume: {
                x: -13,
                y: -3.5,
                z: -13,

                w: 26,
                h: 15,
                d: 10,
            },

            images: [
                i1,
                i2,
                i3,
                i4,
            ],

            parallaxSpeed: {
                min: 0.1,
                max: 0.3
            },

            bumpScale: 0.03,
            metalness: 0.1,
            roughness: 0.5,

            mirroredAmount: 0.5,
        } );

        // Lighting
        const ambientLight = new THREE.AmbientLight(
            '#ffffff',
            0.2
        );

        const pointLight = new THREE.PointLight(
            '#996688',
            20.0,
            100,
            1
        );

        pointLight.position.set( 0, 0, -2 );

        this.flareLight = pointLight;

        // Add to scene
        this.scene.add(
            parallaxVolume,
            ambientLight,
            pointLight
        );

        this._createEffects();
    }

    _createEffects() {
        const light = this.flareLight;
        
        const mainTextureFlare = ASSETHANDLER.loadTexture( lensflarePath1 );
        const secondaryTextureFlare = ASSETHANDLER.loadTexture( lensflarePath2 );

        const lensflare = new Lensflare();
        lensflare.addElement( new LensflareElement( mainTextureFlare, 200, 0, light.color ) );
        lensflare.addElement( new LensflareElement( secondaryTextureFlare, 80, 0.4 ) );
        lensflare.addElement( new LensflareElement( secondaryTextureFlare, 70, 0.5 ) );
        lensflare.addElement( new LensflareElement( secondaryTextureFlare, 60, 0.8 ) );


        light.add( lensflare );
    }

    _update( delta, now ) {
        super._update( delta, now );
    }
}

const parallaxSketch = new ParallaxSketch();
export default parallaxSketch;