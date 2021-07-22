import * as THREE from 'three';

import { volumePointIntersection, sphereVolumeIntersection, spherePointIntersection } from "../Utils";

export class OctreeHelper extends THREE.Object3D {
    constructor( octree ) {
        super();

        this.octree = octree;

        const edges = new THREE.EdgesGeometry( 
            new THREE.BoxBufferGeometry( 1, 1, 1 ),
            1
        );

        /*const material = new THREE.MeshBasicMaterial( {
            color: 'red'
        });
        material.wireframe = true;
        */


        this.octree.traverseNodes( node => {
            const hue = 360 * node.depth / octree.maxDepth;

            const material = new THREE.LineBasicMaterial( { color: `hsl(${hue}, 100%, 50%)` } );
            //const nodeMesh = new THREE.Mesh( geometry, material );
            const nodeMesh = new THREE.LineSegments( edges, material );
            
            const { x, y, z, w, h, d } = node.volume;

            nodeMesh.position.set(
                x + w / 2,
                y + h / 2,
                z + d / 2
            );

            nodeMesh.scale.set( w, h, d );

            this.add( nodeMesh );
        });
    }
}

export class Octree {
    constructor( volume, capacity, maxDepth ) {
        this.volume = volume;
        this.capacity = capacity;
        this.maxDepth = maxDepth;

        this.size = 0;
        this.depth = 1;

        this.subdivided = false;
        this.nodes = [];
        this.entries = [];
    }

    insertAll( points, data ) {
        for( let i = 0; i < points.length; i++ ) {
            let d = null;
            if( data ) {
                d = data[ i ];
            }

            this.insert( points[ i ], d );
        }
    }

    insert( point, data ) {
        if( !volumePointIntersection( this.volume, point )) {
            return false;
        }

        this.size++;

        // A new point should be added to this node
        if( this.entries.length < this.capacity || this.depth === this.maxDepth ) {
            this.entries.push( { point, data } );
        } 
        // Subdivide
        else {
            if( !this.subdivided ) {
                this._subdivide();
            }

            const node = this._getNode( point );
            node.insert( point, data );

            /*this.nodes.forEach( node => {
                node.insert( point, data );
            });*/
        }

        return true;
    }

    // NOTE: function should only be used if the point is known to be inside the current node volume
    _getNode( point ) {
        const { x, y, z, w, h, d } = this.volume;

        const ix = Math.floor( 2.0 * ( point.x - x ) / w );
        const iy = Math.floor( 2.0 * ( point.y - y ) / h );
        const iz = Math.floor( 2.0 * ( point.z - z ) / d );

        const index = ix + 2 * ( iy + 2 * iz );

        const node = this.nodes[ index ];

        return node;
    }

    _subdivide() {
        const { x, y, z, w, h, d } = this.volume;

        for( let cz = 0; cz < 2; cz++ ) 
        for( let cy = 0; cy < 2; cy++ ) 
        for( let cx = 0; cx < 2; cx++ ) {
            const volume = {
                x: x + cx * ( w / 2.0 ),
                y: y + cy * ( h / 2.0 ),
                z: z + cz * ( d / 2.0 ),

                w: w / 2.0,
                h: h / 2.0,
                d: d / 2.0,
            };

            const node = new Octree( volume, this.capacity, this.maxDepth );
            node.depth = this.depth + 1;

            this.nodes.push( node );
        }

        this.subdivided = true;
    }

    _sphereInsideVolume( sphere ) {
        return sphereVolumeIntersection( sphere, this.volume );
    }

    // Get all entires/points/data inside a sphere
    // The "found" array holds everything found so far. 
    sphereQuery( sphere, mode = 'entry', found = [] ) {
        if( !this._sphereInsideVolume( sphere ) ) {
            return found;
        }

        const queryModeConverter = ( () => {
            switch( mode ) {
                case 'entry': return entry => entry;
                case 'point': return entry => entry.point;
                case 'data':  return entry => entry.data;
            }
        })();


        this.entries.forEach( entry => {
            if( spherePointIntersection( sphere, entry.point ) ) {
                found.push( queryModeConverter( entry ) );
            }
        });

        this.nodes.forEach( node => {
            node.sphereQuery( sphere, mode, found );
        });

        return found;
    }

    traverseEntries( callback ) {
        callback = callback || ( () => {} );
        this.entries.forEach( entry => callback( entry, this ) );
        this.nodes.forEach( node => node.traverseEntries( callback ));
    }

    traverseNodes( callback ) {
        callback && callback( this );
        this.nodes.forEach( node => node.traverseNodes( callback ) );
    }

}