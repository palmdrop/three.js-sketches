import * as THREE from 'three';

const color = ( gui, object, property ) => {
    gui.addColor( { [property]: object[property].getHex() }, property )
    .onChange( (color) => object[property].setHex( color ) );
};

const vector = ( gui, object, property ) => {
    gui.add( object[property], 'x', -10, 10 );
    gui.add( object[property], 'y', -10, 10 );
    gui.add( object[property], 'z', -10, 10 );
};

const arbitraryObject = ( gui, params, target, name ) => {
    var folder = gui;
    if( name ) {
        folder = gui.addFolder( name );
    }

    for( const [key, value] of Object.entries(params) ) {
        const tempObject = { [key]: params[key].value };
        folder.add( tempObject, key, value.min, value.max )
        .onChange( value => { target[key] = value } );
    }
};

const pointLight = ( gui, light, name ) => {
    const folder = gui.addFolder( name );

    vector( folder, light, 'position' );
    folder.add( light, 'intensity', 0, 100 );
    color( folder, light, 'color' );
};

const orbPointLight = ( gui, orbLight, name ) => {
    const folder = gui.addFolder( name );

    vector( folder, orbLight, 'position' );

    folder.add( orbLight.opts, 'intensity', 0, 100 )
    .onChange( value => orbLight.light.intensity = value );

    folder.add( orbLight.opts, 'glow', 0, 20 )
    .onChange( 
        value => orbLight.orb.material.color = 
            new THREE.Color( orbLight.opts.color ).multiplyScalar( value )
    );

    const radius = orbLight.opts.radius;
    folder.add( { radius: radius }, 'radius', 0, 5 )
    .onChange( value => orbLight.scale.set( value / radius, value / radius, value / radius ) );

    folder.addColor( orbLight.opts, 'color' )
    .onChange( value => {
        const color = new THREE.Color( value );
        orbLight.orb.material.color = color.multiplyScalar( orbLight.opts.glow );
        orbLight.light.color = color; 
    });
};

export const guiHelpers = {
    color,
    vector,
    pointLight,
    orbPointLight,
    arbitraryObject
}