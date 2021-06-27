import * as THREE from 'three';
import { ReinhardToneMapping } from 'three';

let defaultOpts = {
    color: '#ffffff',
    intensity: 30,
    distance: 10,
    decay: 2,
    glow: 1.5,
    segments: 10,
    radius: 0.1,
    opacity: 1.0,
};

export class OrbPointLight extends THREE.Object3D {
    constructor( opts = {} ) {
        super();

        opts = Object.assign( defaultOpts, opts );

        this.opts = opts;

        const light = new THREE.PointLight( 
            opts.color,
            opts.intensity,
            opts.distance,
            opts.decay
        );

        const orbGeometry = new THREE.SphereGeometry(
            opts.radius,
            opts.segments,
            opts.segments
        );

        const orbMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color( opts.color ).multiplyScalar( opts.glow ),
            opacity: opts.opacity
        });

        const orb = new THREE.Mesh( orbGeometry, orbMaterial );

        this.add(
            light,
            orb
        );

        this.light = light;
        this.orb = orb;
    }
};

