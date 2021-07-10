import * as THREE from 'three';
import { GlowShader } from '../../../shaders/GlowShader';

let defaultOpts = {
    radius: 0.3,

    amount: 0.4,
    softness: 0.05,

    color: '#ffffff',
}

export class GlowMesh extends THREE.Object3D {
    constructor( mesh, camera, opts ) {
        super();
        opts = Object.assign( defaultOpts, opts );

        this.camera = camera;
        this.mesh = mesh.clone();

        this.mesh.material = this._createMaterial();
        this.mesh.scale.multiplyScalar( 1.0 + opts.radius );

        this.mesh.material.uniforms[ 'amount' ].value = opts.amount;
        this.mesh.material.uniforms[ 'softness' ].value = opts.hardness;
        this.mesh.material.uniforms[ 'glowColor' ].value = new THREE.Color( opts.color );

        this.add( this.mesh )
    }

    _createMaterial() {
        let materialOpts = {
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 1.0
        }

        materialOpts = Object.assign( materialOpts, GlowShader );

        return new THREE.ShaderMaterial( materialOpts );
    }

    update() {
        this.mesh.material.uniforms[ 'viewVector' ].value = 
            new THREE.Vector3().subVectors( this.camera.position, this.mesh.position );
    }

}