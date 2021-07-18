import * as THREE from 'three';
import { PointVolume } from '../../components/generation/points/PointVolume';

import { Sketch } from "../template/Sketch";

import { makeNoise3D } from 'fast-simplex-noise';
import { ASSETHANDLER } from '../../systems/assets/AssetHandler';

import circleTexturePath from '../../../assets/sprites/circle.png';
import { SpaceColonizationTree } from '../../components/generation/space-colonization/SpaceColonizationTree';

class WebEntitySketch extends Sketch {
    constructor() {
        super();
    }

    _populateScene() {
        const noise = makeNoise3D();

        const pointVolume = new PointVolume( {
            numberOfPoints: 1000,
            maxNumberOfTries: 10000,

            generationMethod: 'function',
            threshold: 0.3,
            probabilityFunction: ( point ) => {
                //return ( Math.sin( point.x * 3 ) + 1.0 ) / 2.0;
                return noise( 0.2 * point.x, 0.2 * point.y, 0.2 * point.z );
            }
        })

        /*const geometry = new THREE.SphereGeometry( 0.1, 5, 5 );*/

        /*const material = new THREE.MeshBasicMaterial( {
            color: 'white',
        })*/
        const material = new THREE.SpriteMaterial( {
            map: ASSETHANDLER.loadTexture( circleTexturePath ),
            color: 'white',
        });

        pointVolume.points.forEach( point => {
            //const pointMesh = new THREE.Mesh( geometry, material );
            const pointSprite = new THREE.Sprite( material );
            pointSprite.position.copy( point );
            pointSprite.scale.set( 0.2, 0.2, 1.0 );

            this.scene.add( pointSprite );
        });

        console.log( pointVolume.volume );
        const tree = new SpaceColonizationTree( pointVolume.volume, pointVolume.points );
        
    }
}

const webEntitySketch = new WebEntitySketch();
export default webEntitySketch;