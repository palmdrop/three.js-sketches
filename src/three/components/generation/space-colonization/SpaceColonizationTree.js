import * as THREE from 'three';
import { Vector3 } from 'three';
import { Octree } from '../../../utils/tree/Octree';
import { randomUnitVector3, remap } from '../../../utils/Utils';

//import { PointOctree } from 'sparse-octree';

let toArgumentFunction = ( argument ) => {
    if( typeof argument === "function" ) {
        return argument;
    } else {
        return () => argument;
    }
};

class Segment {
    constructor( origin, direction ) {
        this.origin = origin;
        this.direction = direction;

        this.children = [];
    }
}

class SegmentData {
    constructor( segment ) {
        this.segment = segment;
        this.reset();
    }

    normalize() {
        this.newDirection.divideScalar( this.interactions );
    }

    reset() {
        this.newDirection = new THREE.Vector3().copy( this.segment.direction );
        this.interactions = 1;
    }
}

export class SpaceColonizationTree {

    constructor( minDistance, maxDistance, dynamics, stepSize, randomDeviation ) {

        this.minDistance = toArgumentFunction( minDistance );
        this.maxDistance = toArgumentFunction( maxDistance );
        this.dynamics = toArgumentFunction( dynamics );
        this.stepSize = toArgumentFunction( stepSize );
        this.randomDeviation = toArgumentFunction( randomDeviation );

        this.tempVector0 = new THREE.Vector3();
        this.tempVector1 = new THREE.Vector3();
    }

    _createOctree() {
        return new Octree( this.volume, 8, 3 );
    }


    generate( leaves, volume, origin, startDirection, iterations ) {
        this.exhausted = false;
        this.volume = volume;
        this.leaves = leaves;
        this.leavesToDelete = [];

        const root = new Segment( origin, startDirection.clone().normalize() );

        this.segments = this._createOctree();
        this.segments.insert( origin, new SegmentData( root ) );

        for( let i = 0; i < iterations && !this.exhausted; i++ ) this.grow();

        this.root = root;

        return root;
    }

    grow() {
        // If the tree is exhausted, do nothing
        if( this.exhausted ) return true;

        // Set true if at least one segment found a leaf to interact with
        let foundOne = false;

        // Octree of new segments
        const nextSegmentData = this._createOctree();

        // All segments that interacted with a leaf (living segments)
        const interactingSegmentData = new Set();

        // Iterate over all leaves and check if there's a segment that can interact with it
        for( let i = this.leaves.length - 1; i >= 0; i-- ) {
            const leaf = this.leaves[ i ];

            // Find the closest segment (within the maxDistance)
            const closestSegmentData = this._closestSegmentData( leaf );

            // If none is found, continue to next leaf
            if( !closestSegmentData ) continue;
            foundOne = true;

            const segmentOrigin = closestSegmentData.segment.origin;

            const minDistance = this.minDistance( segmentOrigin );
            const dynamics = this.dynamics( segmentOrigin );

            const distSq = leaf.distanceToSquared( segmentOrigin );

            // If the segment is sufficiently close to the leaf, remove the leaf
            if( distSq < minDistance * minDistance ) {
                this.leaves.splice( i, 1 );
            } else {
                // Otherwise, prepare for creating a new segment
                
                // Calculate the desired direction
                const dir = this.tempVector0.lerpVectors( 
                    closestSegmentData.segment.direction, 
                    this.tempVector1.subVectors( leaf, closestSegmentData.segment.origin ).normalize(),
                    dynamics
                );

                // and accumulate (a segment might be attracted by multiple leaves)
                closestSegmentData.newDirection.add( dir );
                closestSegmentData.interactions++;

                interactingSegmentData.add( closestSegmentData );
            }
        };

        // If no segment is close enough to a leaf, then the tree is exhausted
        if( !foundOne ) {
            this.exhausted = true;
            return true;
        }

        // Iterate over all the segments that interacted with a leaf
        interactingSegmentData.forEach( segmentData => {
            segmentData.normalize();

            const randomDeviation = this.randomDeviation( segmentData.segment.origin );
            const stepSize = this.stepSize( segmentData.segment.origin );

            const newPosition = new THREE.Vector3().addVectors( 
                segmentData.segment.origin,
                this.tempVector0.copy( segmentData.newDirection ).multiplyScalar( stepSize )
            );
            newPosition.add( 
                randomUnitVector3( this.tempVector0 ).multiplyScalar( randomDeviation ) 
            );

            const newSegment = new Segment( newPosition, segmentData.newDirection );
            
            segmentData.reset();
            segmentData.segment.children.push( newSegment );

            nextSegmentData.insert( segmentData.segment.origin, segmentData );
            nextSegmentData.insert( newSegment.origin, new SegmentData( newSegment ) );
        });

        this.segments = nextSegmentData;

        return false;
    }

    _closestSegmentData( leaf ) {
        let closest = null;

        const maxDistance = this.maxDistance( leaf );

        const nearbySegmentsData = this.segments.sphereQuery( { center: leaf, radius: maxDistance } );

        let minDistSq = maxDistance * maxDistance;

        nearbySegmentsData.forEach( ({ point, data }) => {
            const distSq = leaf.distanceToSquared( point );
            if( distSq < minDistSq ) {
                closest = data;
                minDistSq = distSq;
            }
        });

        return closest;
    }

    traverse( callback ) {
        const traverseSegment = ( segment, parent, depth ) => {
            callback( segment, parent, depth );

            segment.children.forEach( child => {
                traverseSegment( child, segment, depth + 1 );
            });
        };

        traverseSegment( this.root, null, 1 );
    }

    calculateDepths() {
        // Calculate max depth
        let maxDepth = -1;

        this.traverse( ( segment, parent, depth ) => {
            // And set the depth of each segment
            segment.depth = depth;

            maxDepth = Math.max( maxDepth, depth );
        });
        this.maxDepth = maxDepth;

        // Calculate the reverse depth (number of segments from a leaf)
        const calculateReverseDepth = ( segment ) => {
            let count = 0;

            segment.children.forEach( child => {
                count = Math.max( count, calculateReverseDepth( child ) );
            });

            segment.reverseDepth = 1 + count;

            return segment.reverseDepth;
        };
        calculateReverseDepth( this.root );
    }

    toSkeleton( threshold ) {
        // TODO use threshold to determine if a "joint" should exist, i.e if the angle(dot?) between to adjacent directions exceeds the
        // TODO threshold, then keep the segment, and create a "joint"

        
    }

    buildThreeObject( material, protrude = 0.0 ) {
        this.calculateDepths();

        const treeObject = new THREE.Object3D();

        //const geometry = new THREE.BoxBufferGeometry( 1.0, 1.0, 1.0 );
        const geometry = new THREE.CylinderGeometry( 1.0, 1.0, 1.0, 5.0 );

        geometry.applyMatrix4( new THREE.Matrix4().makeRotationX( Math.PI / 2 ));

        this.traverse( ( segment, parent, depth ) => {
            if( !parent ) {
                this.root.object = treeObject;
                return;
            } 

            const segmentObject = new THREE.Object3D();
            const segmentMesh = new THREE.Mesh( geometry, material );

            const relativePosition = this.tempVector0.subVectors( segment.origin, parent.origin );
            const length = relativePosition.length();

            segmentMesh.lookAt( relativePosition );
            segmentMesh.position.copy( relativePosition ).divideScalar( -2.0 );

            const width = remap( segment.reverseDepth, this.maxDepth, 1, 0.2, 0.01 );
            segmentMesh.scale.set( width, width, ( 1.0 + protrude ) * length );

            segmentObject.position.copy( relativePosition );
            segmentObject.add( segmentMesh );

            segmentObject.animationUpdate = ( delta, now ) => {
                //segmentObject.rotation.x += delta * 0.01;
                //TODO rotate around parents directions, and adjust angle! 
            };

            parent.object.add( segmentObject );

            segment.object = segmentObject;
        });

        /*this.traverse( ( segment, parent ) => {
            if( !parent ) {
                this.root.object = treeObject;
                this.root.relativeDirection = this.root.direction;
                this.root.length = 0;
                return;
            }

            const relativeDirection = new Vector3().subVectors( segment.direction, parent.relativeDirection );

            const relativePosition = new Vector3().subVectors( segment.origin, parent.origin );
            const length = relativePosition.length();
            const direction = new Vector3().copy( relativePosition ).normalize();

            const segmentMesh = new THREE.Mesh( geometry, material );
            //segmentMesh.position.copy( relativePosition );
            segmentMesh.lookAt( direction );
            segmentMesh.position.set( 0, 0, length );

            parent.object.add( segmentMesh );

            segment.object = segmentMesh;
            segment.relativeDirection = relativeDirection;
        });*/

        return treeObject;
    }

}

const v = 0;
