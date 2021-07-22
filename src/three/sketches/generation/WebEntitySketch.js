import * as THREE from 'three';
import { PointVolume } from '../../components/generation/points/PointVolume';

import { Sketch } from "../template/Sketch";

import { makeNoise3D } from 'fast-simplex-noise';
import { ASSETHANDLER } from '../../systems/assets/AssetHandler';

import circleTexturePath from '../../../assets/sprites/circle.png';
import { SpaceColonizationTree } from '../../components/generation/space-colonization/SpaceColonizationTree';
import { Octree, OctreeHelper } from '../../utils/tree/Octree';
import { random } from '../../utils/Utils';

import treeTexturePath from '../../../assets/textures/ridges1.png';

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

        const data = [];
        const points = new THREE.Group();
        points.visible = false;

        this.gui.add( points, 'visible' );

        pointVolume.points.forEach( point => {
            const material = new THREE.SpriteMaterial( {
                map: ASSETHANDLER.loadTexture( circleTexturePath ),
                color: 'white',
            });
            //const pointMesh = new THREE.Mesh( geometry, material );
            const pointSprite = new THREE.Sprite( material );
            pointSprite.position.copy( point );
            pointSprite.scale.set( 0.2, 0.2, 1.0 );
            //pointSprite.scale.set( 0.0, 0.0, 1.0 );

            data.push( pointSprite );
            points.add( pointSprite );
        });
        this.scene.add( points );

        //const tree = new SpaceColonizationTree( pointVolume.volume, pointVolume.points );

        /*const octree = new Octree( pointVolume.volume, 8, 3 );
        octree.insertAll( pointVolume.points, data );

        const octreeHelper = new OctreeHelper( octree );
        this.scene.add( octreeHelper );

        const sphere = { center: new THREE.Vector3( random(-2, 2), random(-2, 2), random(-2, 2) ), radius: random(1, 4) };

        entries.forEach( ( { point, data } ) => {
            data.material.color.set(0xff0000);
            //data.scale.set( 0.2, 0.2, 1.0 );
        });

        const sphereMesh = new THREE.Mesh(
            new THREE.SphereBufferGeometry( sphere.radius, 10, 10 ),
            new THREE.MeshBasicMaterial( { color: 'green' })
        );
        sphereMesh.material.wireframe = true;
        sphereMesh.position.copy( sphere.center );

        this.scene.add( sphereMesh );*/

        this.scene.fog = new THREE.Fog( this.backgroundColor, 0.1, 15.0 );

        const directionalLight = new THREE.DirectionalLight( 'white', 5 );
        directionalLight.position.set( 0, 10, 10 );
        this.scene.add( directionalLight );

        const tree = new SpaceColonizationTree( 
            0.3, // Min dist
            2,   // Max dist
            0.8, // Dynamics
            0.1, // Step size
            0.01  // Random deviation
        );

        tree.generate( 
            pointVolume.points, 
            pointVolume.volume, 
            new THREE.Vector3(), 
            new THREE.Vector3(0, 1, 0),
            200
        );

        const treeObject = new THREE.Object3D();
        const treeMaterial = new THREE.MeshStandardMaterial( { 
            color: 'brown',

            //map: ASSETHANDLER.loadTexture( treeTexturePath ),
            //bumpMap: ASSETHANDLER.loadTexture( treeTexturePath ),
            bumpScale: 0.1,

            metalness: 0.0,
            roughness: 0.8
        });
        const treeSegmentGeometry = new THREE.BoxBufferGeometry( 1, 1, 1 );

        this.scene.add( tree.buildThreeObject( treeMaterial, 0.2 ) );
    }
}

const webEntitySketch = new WebEntitySketch();
export default webEntitySketch;