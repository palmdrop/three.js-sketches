import * as THREE from 'three';

export const square = ( v ) => v * v;

export const volumePointIntersection = ( volume, point ) => {
    const { x, y, z, w, h, d } = volume;

    return ( point.x >= x ) && ( point.x < ( x + w ) )
        && ( point.y >= y ) && ( point.y < ( y + h ) )
        && ( point.z >= z ) && ( point.z < ( z + d ) );
};

export const spherePointIntersection = ( sphere, point ) => {
    const { center, radius } = sphere;
    
    const distanceSquared = center.distanceToSquared( point );

    return distanceSquared < square( radius );
};


//let closestPoint = new THREE.Vector3();
let box3 = new THREE.Box3();
let sphere = new THREE.Sphere();
export const sphereVolumeIntersection = ( sphere, volume ) => {
    const { center, radius } = sphere;
    const { x, y, z, w, h, d } = volume;

    box3.min.set( x, y, z );
    box3.max.set( x + w, y + h, z + d );

    sphere.center.copy( center );
    sphere.radius = radius;

    return box3.intersectsSphere( sphere );
};

export const randomUnitVector3 = ( vector ) => {
    if( !vector ) vector = new THREE.Vector3();

    const angle = random( 0.0, Math.PI * 2.0 );
    const vz = random( 0.0, 2.0 ) - 1;
    const vzBase = Math.sqrt( 1 - vz * vz );
    const vx = vzBase * Math.cos( angle );
    const vy = vzBase * Math.sin( angle );

    return vector.set( vx, vy, vz );
};

export const random = ( min = 0, max = 1 ) => {
    return Math.random() * ( max - min ) + min;
};

export const randomPointInVolume = ( volume ) => {
    const random = ( start, length ) => {
        return Math.random() * length + start;
    }

    return new THREE.Vector3(
        random( volume.x, volume.w ),
        random( volume.y, volume.h ),
        random( volume.z, volume.d ),
    );
};

export const remap = ( value, min, max, newMin, newMax ) => {
    const normalized = ( value - min ) / ( max - min )
    return normalized * ( newMax - newMin ) + newMin;
};

export const forEachChild = ( object, operation ) => {
    if( !object.children ) return;

    object.children.forEach( ( child ) => {
        operation( child );
        forEachChild( child, operation );
    });
}
