import * as THREE from 'three';

import { ASSETHANDLER } from '../../../systems/assets/AssetHandler';

import { random, randomPointInVolume, remap } from '../../../utils/Utils';

let defaultOpts = {
    instances: 20,
    instanceScale: 0.01,
    instanceScaleVariation: 0.1,
    layers: 10,

    color: '#ffffff',
    opacity: 1.0,

    volume: {
        x: -3,
        y: -2.5,
        z: 0,

        w: 6,
        h: 5,
        d: 2,
    },

    parallaxSpeed: {
        min: 0.1,
        max: 0.4,
    },

    mirroredAmount: 0.0,
    placeEvenly: false,
    placementVariation: 0.0,

    materialOpts: {},

    images: null,
}

export class ParallaxVolume extends THREE.Group {
    constructor( opts = {} ) {
        super();

        //TODO add edge mode: allow edges to be faded out/in
        //TODO add same for when image is close to edge of volume! fade out?

        opts = Object.assign( defaultOpts, opts );
        if( !opts.images || !Array.isArray( opts.images )) console.error( "[Parallax Volume]: Images are not supplied in the right format (array)" );

        const geometry = new THREE.PlaneBufferGeometry( 1, 1 );
        const materials = [];

        // Create materials
        for( let i = 0; i < opts.images.length; i++ ) {
            const texture = ASSETHANDLER.loadTexture( opts.images[ i ] );

            const materialOpts = opts.materialOpts;
            materialOpts.color = opts.color;
            materialOpts.map = texture;
            materialOpts.transparent = true;
            materialOpts.opacity = opts.transparent;
            materialOpts.bumpMap = texture;

            materials[ i ] = new THREE.MeshStandardMaterial( materialOpts );
        }

        //TODO on each texture load, create all materials and instances with that material!
        //TODO either create equal amount of each, or randomize slightly

        const randomMaterial = () => {
            return materials[ Math.floor( Math.random() * opts.images.length ) ];
        };

        const layerZOffset = opts.volume.d / opts.layers;
        const instancesPerLayer = opts.instances / opts.layers;
        const instanceZOffset = layerZOffset / instancesPerLayer;
        const instanceYVariation = opts.volume.h / opts.layers;

        const averageInstanceXOffset = instancesPerLayer / opts.volume.w;

        // Create instances (meshes) for each layer
        for( let layer = 0; layer < opts.layers; layer++ ) {
            const layerY = remap( layer, 0, opts.layers, opts.volume.y, opts.volume.y + opts.volume.h );
            const layerZ = remap( layer, opts.layers, 0, opts.volume.z, opts.volume.z + opts.volume.d );
            const speed = remap( layer, 0, opts.layers, opts.parallaxSpeed.max, opts.parallaxSpeed.min );
            let currentOffset = 0.0;
            for( let i = 0; i < instancesPerLayer; i++ ) {
                // Fetch material and create mesh
                const material = randomMaterial();
                const mesh = new THREE.Mesh( geometry, material );

                // Set position
                let x;
                if( opts.placeEvenly ) {
                    x = remap( i, 0, instancesPerLayer, opts.volume.x, opts.volume.x + opts.volume.w );
                    x += opts.placementVariation * random( -averageInstanceXOffset / 2, averageInstanceXOffset );
                } else {
                    x = random( opts.volume.x, opts.volume.x + opts.volume.w );
                }

                const y = layerY + random( -instanceYVariation / 2, instanceYVariation / 2 );
                const z = layerZ + currentOffset;
                currentOffset += instanceZOffset;

                mesh.position.set( x, y, z );

                // Scale mesh
                const mirrored = random() < opts.mirroredAmount;

                let scaleX = ( mirrored ? -1.0 : 1.0 ) * opts.instanceScale;
                let scaleY = opts.instanceScale;

                const scaleVariation = 1.0 + random( -opts.instanceScaleVariation / 2, opts.instanceScaleVariation );
                scaleX *= scaleVariation;
                scaleY *= scaleVariation;

                mesh.scale.set( scaleX, scaleY, 1.0 );

                // Set update function
                mesh.animationUpdate = ( delta, now ) => {
                    // Translate in X direction
                    mesh.position.x += speed * delta;

                    // Wrap around when outside volume
                    if( mesh.position.x >= opts.volume.x + opts.volume.w ) {
                        mesh.position.x = opts.volume.x;
                    } else if( mesh.position.x < opts.volume.x ) {
                        mesh.position.x = opts.volume.x + opts.volume.w;
                    }
                };

                this.add( mesh );
            }
        }
    }
}