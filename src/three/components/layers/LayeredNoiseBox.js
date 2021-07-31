import * as THREE from 'three';
import { LayerShader } from '../../shaders/layer/LayerShader';

import ditheringTexturePath from '../../../assets/noise/blue/LDR_RGBA_7.png';
import { ASSETHANDLER } from '../../systems/assets/AssetHandler';

const randomVectorColor = ( layer, alpha ) => {
    const color = new THREE.Color().setHSL(
        Math.random(),
        1.0 * Math.random(),
        Math.random() * 0.4 + 0.3
    );

    return new THREE.Vector4(
        color.r,
        color.g,
        color.b,
        alpha
    );
};

const getDefaultOpts = () => { 
    return {
        // Dimensions
        width: 100,
        height: 100,
        depth: 100,

        // Layers
        numberOfLayers: 10,

        // Noise
        frequency: new THREE.Vector3( 1.0, 1.0, 1.0 ),
        power: 3.2,

        warpAmount: 10.0,

        // Time
        timeOffset: new THREE.Vector3( 0.0, 0.0, 0.5 ),

        // Look
        opacity: 1.0,
        colorFunction: randomVectorColor,

        ditheringAmount: 0.04,
        staticAmount: 0.1,

        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    };
}

const toLayerFunction = ( option ) => {
    if( typeof option === 'function' ) return option;
    return () => option;
};

export class LayeredNoiseBox extends THREE.Group {

    constructor( opts = {}, onFinished ) {
        super();

        opts = Object.assign( getDefaultOpts(), opts );
        opts.frequency = toLayerFunction( opts.frequency );
        opts.power = toLayerFunction( opts.power );
        opts.opacity = toLayerFunction( opts.opacity );

        opts.ditheringAmount = toLayerFunction( opts.ditheringAmount );
        opts.staticAmount = toLayerFunction( opts.staticAmount );

        opts.warpAmount = toLayerFunction( opts.warpAmount );

        this.opts = opts;

        const geometry = new THREE.PlaneBufferGeometry( 1, 1 );
        const sourceMaterial = this._createSourceMaterial();

        const layerOffsets = opts.depth / opts.numberOfLayers;
        const zStart = -( opts.numberOfLayers * layerOffsets ) / 2.0;


        const ditheringTexture = ASSETHANDLER.loadTexture( ditheringTexturePath, false, ( texture ) => {
            ditheringTexture.wrapS = THREE.RepeatWrapping;
            ditheringTexture.wrapT = THREE.RepeatWrapping;

            this._createLayers( geometry, sourceMaterial, zStart, layerOffsets, texture );

            onFinished && onFinished();
        } );

    }

    _createSourceMaterial() {
        const sourceMaterial = new THREE.ShaderMaterial( LayerShader );
        sourceMaterial.blending = this.opts.blending;
        sourceMaterial.side = this.opts.side;
        sourceMaterial.transparent = true;
        sourceMaterial.opacity = 1.0;


        return sourceMaterial;
    }

    _createLayers( geometry, sourceMaterial, zStart, layerOffsets, ditheringTexture ) {
        this.layerPlanes = [];

        for( let i = 0; i < this.opts.numberOfLayers; i++ ) {
            const material = sourceMaterial.clone();
            
            // Set uniforms
            material.uniforms.frequency.value = this.opts.frequency( i );
            material.uniforms.power.value = this.opts.power( i );
            material.uniforms.opacity.value = this.opts.opacity( i );

            material.uniforms.warpAmount.value = this.opts.warpAmount( i );

            material.uniforms.size.value = new THREE.Vector2( this.opts.width, this.opts.height );

            material.uniforms.color1.value = this.opts.colorFunction( i, 0.0 );
            material.uniforms.color2.value = this.opts.colorFunction( i, 1.0 );

            material.uniforms.timeOffset.value = this.opts.timeOffset;
            material.uniforms.offset.value = this.opts.offset;

            // Set dithering texture
            material.uniforms.hasDitheringTexture.value = true;
            material.uniforms.ditheringTexture.value = ditheringTexture;
            material.uniforms.ditheringTextureDimensions.value = new THREE.Vector2( ditheringTexture.image.width, ditheringTexture.image.height );
            material.uniforms.ditheringAmount.value = this.opts.ditheringAmount( i );

            material.uniforms.staticAmount.value = this.opts.staticAmount( i );

            // Create layer
            const layer = new THREE.Mesh( geometry, material );

            const z = i * layerOffsets + zStart;
            layer.position.z = z;
            material.uniforms.z.value = z; 

            layer.scale.set( this.opts.width, this.opts.height, 1 );

            layer.animationUpdate = ( delta, now ) => {
                material.uniforms.time.value = now;
            };

            // Add to group 
            this.add( layer );
            this.layerPlanes.push( layer );
        }
    }

    setMaterialUniform( uniformName, value, layer ) {
        if( layer ) {
            const uniform = this.layerPlanes[ layer ].material.uniforms[ uniformName ];
            uniform.value = value;
            return;
        }

        for( let i = 0; i < this.layerPlanes.length; i++ ) {
            const uniform = this.layerPlanes[ i ].material.uniforms[ uniformName ];
            if( typeof value === 'function' ) {
                const v = value( i );
                uniform.value = v;
            } else {
                uniform.value = value;
            }
        }

    }

}