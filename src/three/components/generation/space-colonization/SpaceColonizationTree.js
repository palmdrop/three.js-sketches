import * as THREE from 'three';

//import { OctreeHelper, PointOctree } from 'sparse-octree';
//import { Octree } from 'sparse-octree';

export class SpaceColonizationTree extends THREE.Group {
    constructor( { x, y, z, w, h, d }, points, ) {
        super();

        const min = new THREE.Vector3( x, y, z );
        const max = new THREE.Vector3( x + w, y + h, z + d );

        /*this.octree = new PointOctree( 
            min, 
            max,
            0.0, // bias
            8, // max points (per leaf)
            4, // max depth
        );

        points.forEach( point => {
            this.octree.set( point, null);
        });*/

        //this.helper = new OctreeHelper( this.octree );

        //this.add( this.helper );
        var test = class {
            v;
        }
    }

}

const v = 0;
