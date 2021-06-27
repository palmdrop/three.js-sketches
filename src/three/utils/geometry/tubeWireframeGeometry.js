import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';

// Inspired by https://github.com/mattdesl/three-tube-wireframe/blob/master/three-tube-wireframe.js

// Only works properly with THREE.EdgesGeometry

const edgeModes = [
    //'closed',
    'open',
    //'extrude', // Will also be closed
    //'open-extrude',
    'quad',    // A quad will be placed at the joints
    'sphere',  // A sphere will be placed at the joints
];

const tubeModes = [
    'visible',
    'hidden'
];

const defaultOpts = {
    edgeMode: edgeModes[ 0 ],
    radius: 0.05, 
    tubularSegments: 1,
    radialSegments: 10,
    tubeMode: tubeModes[ 0 ],
};

export const toTubeWireframeGeometry = ( geometry, opts = {} ) => {
    opts = Object.assign( defaultOpts, opts );

    const indexAttr = geometry.getIndex();
    const positionAttr = geometry.getAttribute( 'position' );
    const indexCount = indexAttr ? indexAttr.count : positionAttr.count;

    const indexArr = [ 0, 0 ];

    let v1 = new THREE.Vector3();
    let v2 = new THREE.Vector3();
    let tubes = [];

    const edges = {};
    const hash = ( v ) => {
        const precision = 10;
        return `${ Math.round( v.x * precision ) },${ Math.round( v.y * precision ) },${ Math.round( v.z * precision ) }`;
    };

    for( let i = 0; i < indexCount; i += 2 ) {
        if( indexAttr ) {
            indexArr[ 0 ] = indexAttr.getX( i );
            indexArr[ 1 ] = indexAttr.getX( i + 1 );
        } else {
            indexArr[ 0 ] = i;
            indexArr[ 1 ] = i + 1;
        }

        v1.fromBufferAttribute( positionAttr, indexArr[ 0 ] );
        v2.fromBufferAttribute( positionAttr, indexArr[ 1 ] );

        const h1 = hash( v1 );
        const h2 = hash( v2 );

        edges[ h1 ] = v1.clone();
        edges[ h2 ] = v2.clone();

        const line = new THREE.LineCurve3( edges[ h1 ], edges[ h2 ] );
        const tubeGeometry = new THREE.TubeGeometry( 
            line, 
            opts.tubularSegments, 
            opts.radius, 
            opts.radialSegments,
            false
        );

        tubes.push( tubeGeometry );
    }

    const joints = [];

    if( opts.edgeMode !== 'open' ) {
        Object.entries( edges ).map( ( [, edge ] ) => {
            const joint = (opts.edgeMode === 'sphere')
                ? new THREE.SphereBufferGeometry( opts.radius * 1.1, opts.radialSegments, opts.radialSegments )
                : new THREE.BoxBufferGeometry( opts.radius * 2, opts.radius * 2, opts.radius * 2, opts.radialSegments, opts.radialSegments, opts.radialSegments );

            joint.translate( edge.x, edge.y, edge.z );

            joints.push( joint );
        });
    }

    const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
        [
            ...(opts.tubeMode === 'visible' ? tubes : []), 
            ...joints
        ],
        false
    );

    return mergedGeometry;
};
