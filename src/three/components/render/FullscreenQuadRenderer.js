import * as THREE from 'three';

export const createFullScreenTextureRenderer = ( renderer, texture, renderTarget ) => {
    return new FullscreenQuadRenderer( 
        renderer, 
        new THREE.MeshBasicMaterial( { map: texture }), 
        renderTarget 
    );
};

export class FullscreenQuadRenderer {
    constructor( renderer, material, renderTarget = null ) {
        this.renderer = renderer; 
        this.material = material;
        this.renderTarget = renderTarget;
        this.scene = new THREE.Scene();

        this.camera = new THREE.OrthographicCamera(
            -1, 1, -1, 1, 0, 10000 
        );

        const geometry = new THREE.PlaneBufferGeometry( 1, 1 );

        const quad = new THREE.Mesh(
            geometry,
            material
        );

        quad.position.set( 0, 0, -10000 );

        this.quad = quad;

        this.scene.add(
            quad
        );

        this.setSize();
    }

    setSize( dimensions ) {
        if( !dimensions ) {
            dimensions = this.renderer.getSize( new THREE.Vector2() );
        }

        const width = dimensions.width;
        const height = dimensions.height;

        this.camera.left   = -width / 2;
        this.camera.right  =  width / 2;
        this.camera.top    =  height / 2;
        this.camera.bottom = -height / 2;
        this.camera.updateProjectionMatrix();

        this.quad.scale.set( width, height, 1.0 );

        this.width = width;
        this.height = height;

        if( this.renderTarget ) this.renderTarget.setSize( width, height );
    }

    render( renderTarget ) {
        if( renderTarget )           this.renderer.setRenderTarget( renderTarget );
        else if( this.renderTarget ) this.renderer.setRenderTarget( this.renderTarget );
        else                         this.renderer.setRenderTarget( null );

        this.renderer.render( this.scene, this.camera );
    }
}
