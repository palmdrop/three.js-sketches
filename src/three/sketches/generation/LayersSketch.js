import * as THREE from 'three';

import { Sketch } from "../template/Sketch";

import { LayeredNoiseBox } from '../../components/layers/LayeredNoiseBox';

import { random, remap } from '../../utils/Utils';

class LayersSketch extends Sketch {

    constructor() {
        super();

        this.backgroundColor = new THREE.Color( 0x000000 );

        this.far = 100000;
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
        //TODO render simple background, noise + color

        //TODO experiment with different blending function
        // TODO apply interesting warps, extreme "wobble" effects, etc
        const layeredNoiseBox = new LayeredNoiseBox( {
            width: 200,
            height: 200,
            depth: 200,

            offset: new THREE.Vector3( 0, 0, 0 ),

            frequency: ( layer ) => {
                const frequency = new THREE.Vector3( 0.01, 0.01, 0.001 )
                frequency.multiplyScalar( 1.0 + layer * 0.1 );
                return frequency;
            },

            timeOffset: new THREE.Vector3( 0.0, 0.0, 0.5 ),

            numberOfLayers: 100,

            power: 5,

            opacity: 0.5,

            ditheringAmount: 0.1,
            staticAmount: 0.0,
            
        }, () => {
            this._detectUpdatables();
        });

        const noiseBox = this.gui.addFolder( 'Noise box' );

        const createRangeHelper = ( parent, uniform, range, min, max, updateFunction ) => {
            const folder = parent.addFolder( uniform );

            const onChange = () => {
                layeredNoiseBox.setMaterialUniform( uniform, updateFunction );
            };

            folder.add( range, 'min', min, max, 0.001 )
            .onChange( onChange );

            folder.add( range, 'max', min, max, 0.001 )
            .onChange( onChange );

            return folder;
        };

        // Frequency helper
        const scale = new THREE.Vector3( 1.0, 1.0, 0.1 );
        const frequencyRange = { min: 0.01, max: 0.1 };
        const updateFrequency = ( layer ) => {
            return scale.clone().multiplyScalar( 
                remap( layer, 0, layeredNoiseBox.layerPlanes.length, frequencyRange.min, frequencyRange.max ) 
            );
        };

        const frequencyFolder = createRangeHelper( noiseBox, 'frequency', frequencyRange, 0.0, 1.0, updateFrequency );

        frequencyFolder.add( scale, 'x', 0.0, 1.0, 0.01 )
        .onChange( () => layeredNoiseBox.setMaterialUniform( 'frequency', updateFrequency ) );
        frequencyFolder.add( scale, 'y', 0.0, 1.0, 0.01 )
        .onChange( () => layeredNoiseBox.setMaterialUniform( 'frequency', updateFrequency ) );
        frequencyFolder.add( scale, 'z', 0.0, 1.0, 0.01 )
        .onChange( () => layeredNoiseBox.setMaterialUniform( 'frequency', updateFrequency ) );

        // Opacity helper
        const opacityRange = { min: 0.5, max: 0.5 };
        const updateOpacity = ( layer ) => {
            return remap( layer, 0, layeredNoiseBox.layerPlanes.length, opacityRange.min, opacityRange.max );
        }

        createRangeHelper( noiseBox, 'opacity', opacityRange, 0.0, 1.0, updateOpacity );

        // Power helper
        const powerRange = { min: 0.1, max: 10.0 };
        const updatePower = ( layer ) => {
            return remap( layer, 0, layeredNoiseBox.layerPlanes.length, powerRange.min, powerRange.max );
        };

        createRangeHelper( noiseBox, 'power', powerRange, 0.1, 10.0, updatePower );

        // Static/dithering
        const ditherRange = { min: 0.1, max: 0.1 };
        const updateDithering = ( layer ) => {
            return remap( layer, 0, layeredNoiseBox.layerPlanes.length, ditherRange.min, ditherRange.max );
        }

        createRangeHelper( noiseBox, 'ditheringAmount', ditherRange, 0.0, 1.0, updateDithering );

        const staticRange = { min: 0.0, max: 0.0 };
        const updateStatic = ( layer ) => {
            return remap( layer, 0, layeredNoiseBox.layerPlanes.length, staticRange.min, staticRange.max );
        }

        createRangeHelper( noiseBox, 'staticAmount', staticRange, 0.0, 1.0, updateStatic );

        // Domain warp
        const warpRange = { min: 0.0, max: 100.0 };
        const updateWarp = ( layer ) => {
            return remap( layer, 0, layeredNoiseBox.layerPlanes.length, warpRange.min, warpRange.max );
        }

        createRangeHelper( noiseBox, 'warpAmount', warpRange, 0.0, 100.0, updateWarp );


        

        this.scene.add( layeredNoiseBox );
    }
}

const sketch = new LayersSketch();

export default sketch;
