import * as THREE from 'three';
import { random } from '../../../utils/Utils';

const generationMethods = [
    'uniform',
    'function',
    'poisson'
];

const defaultOpts = {
    volume: {
        x: -5,
        y: -5,
        z: -5,
        w: 10,
        h: 10,
        d: 10,
    },

    generationMethod: 'uniform',
    
    // Uniform
    numberOfPoints: 100, // also used by function

    // Function
    maxNumberOfTries: 1000,
    threshold: 0.7,

    // Poisson

    probabilityFunction: null,
}

export class PointVolume {
    constructor( opts ) {
        opts = Object.assign( defaultOpts, opts );

        this.volume = opts.volume;

        this.points = [];
        this._generatePoints ( opts );
    }

    _generatePoints( opts ) {
        switch( opts.generationMethod ) {
           case 'uniform': this._uniformPoints( opts ); break;
           case 'function': this._functionPoints( opts ); break;
           case 'poisson': this._poissonDiskSamplingPoints( opts ); break;
        }
    }

    _randomInVolume( { x, y, z, w, h, d } ) {
        return new THREE.Vector3(
            random( x, x + w ),
            random( y, y + h ),
            random( z, z + d )
        );
    }

    _uniformPoints( opts ) {
        for( let i = 0; i < opts.numberOfPoints; i++ ) {
            this.points.push( this._randomInVolume( opts.volume ) );
        }
    }

    _functionPoints( opts ) {
        let count = 0;
        for( let i = 0; i < opts.maxNumberOfTries && count < opts.numberOfPoints; i++ ) {
            const point = this._randomInVolume( opts.volume );
            const p = opts.probabilityFunction( point );

            if( p > opts.threshold ) {
                this.points.push( point );
            }
        }
    }

    _poissonDiskSamplingPoints( opts ) {

    }



}