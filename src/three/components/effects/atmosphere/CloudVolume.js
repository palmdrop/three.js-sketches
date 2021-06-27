import * as THREE from 'three';

import { ASSETHANDLER } from '../../../systems/assets/AssetHandler';

import defaultPath from '../../../../assets/images/smoke1.png';

let defaultOpts = {
    instances: 50,
    instanceSize: 10,
    color: '#ffffff',
    texturePath: defaultPath,
    textureOpacity: 0.05,

    volume: {
        x: -5,
        y: -5,
        z: -5,

        w: 10,
        h: 10,
        d: 10,
    },

    rotationSpeed: {
        min: -0.2,
        max: 0.2
    },

    camera: null,
    useSprites: true,
};

const randomPoint = ( volume ) => {
    const random = ( start, length ) => {
        return Math.random() * length + start;
    }

    return new THREE.Vector3(
        random( volume.x, volume.w ),
        random( volume.y, volume.h ),
        random( volume.z, volume.d ),

    );
};

export class CloudVolume extends THREE.Group {
    _createMaterial( opts ) {
        const texture = ASSETHANDLER.loadTexture( opts.texturePath );

        let material;
        let materialOpts = {
            color: opts.color,
            map: texture,
            transparent: true,
            opacity: opts.textureOpacity
        };

        if( !opts.useSprites && opts.camera ) {
            material = new THREE.MeshLambertMaterial( materialOpts )
        } else {
            material = new THREE.SpriteMaterial( materialOpts );
        }

        return material;
    }


    constructor( opts = {} ) {
        super();
        opts = Object.assign( defaultOpts, opts );

        const instanceGeometry = new THREE.PlaneBufferGeometry( opts.instanceSize, opts.instanceSize );
        const material = this._createMaterial( opts );

        for( let i = 0; i < opts.instances; i++ ) {
            const position = randomPoint( opts.volume );
            let cloud;

            if( !opts.useSprites && opts.camera ) {
                const cloudMesh = new THREE.Mesh( instanceGeometry, material );

                cloudMesh.rotation.z = Math.random() * 2 * Math.PI;

                cloud = new THREE.Object3D();
                cloud.position.set(
                    position.x,
                    position.y,
                    position.z
                );
                cloud.add( cloudMesh );

                const rotationSpeed = 
                    Math.random() * ( opts.rotationSpeed.max - opts.rotationSpeed.min ) 
                    + opts.rotationSpeed.min;

                cloud.animationUpdate = ( delta, now ) => {
                    cloud.quaternion.copy( opts.camera.quaternion );
                    cloudMesh.rotation.z += delta * rotationSpeed;
                };
            } else {
                cloud = new THREE.Sprite( material );
                cloud.scale.set( opts.instanceSize, opts.instanceSize, 1 );
                cloud.position.set(
                    position.x,
                    position.y,
                    position.z
                );
            }

            this.add( cloud );
        }

    }

}