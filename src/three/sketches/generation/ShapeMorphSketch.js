import * as THREE from 'three';
import { ShapeMorphShader } from '../../shaders/shapeMorph/ShapeMorphShader';

import { Sketch } from "../template/Sketch";

class ShapeMorphSketch extends Sketch {

    constructor() {
        super();
    }    


    _populateScene() {
        const geometry = 
            //new THREE.PlaneBufferGeometry( 1, 1 );
            new THREE.BoxGeometry( 1.0, 1.0, 1.0 );
        const material = new THREE.ShaderMaterial( ShapeMorphShader );
        material.blending = THREE.NormalBlending;
        //planeMaterial.side = THREE.;
        material.transparent = true;
        material.opacity = 1.0;

        this.material = material;

        const mesh = new THREE.Mesh( geometry, material );
        mesh.scale.set( 10, 10, 10 );

        this.bounds = new THREE.Box3( new THREE.Vector3( -5, -5, -5 ), new THREE.Vector3( 5, 5, 5 ) );

        this.scene.add( mesh );

        this.camera.position.z = 15;


    }

    _update( delta, now ) {
        super._update( delta, now );

        this.camera.getWorldDirection(
            this.material.uniforms.viewDirection.value
        );

        this.material.uniforms.eyePosition.value = this.camera.position;
        this.material.uniforms.time.value = now;

        if( this.bounds.containsPoint( this.camera.position ) ) {
            this.material.side = THREE.BackSide;
        } else {
            this.material.side = THREE.FrontSide;
        }



    }
    


}

const sketch = new ShapeMorphSketch();
export default sketch;