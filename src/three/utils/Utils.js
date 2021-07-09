import * as THREE from 'three';

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