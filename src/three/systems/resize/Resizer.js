import * as THREE from 'three'

class Resizer {
    constructor(container, camera, renderer, useDevicePixelRatio = false) {
        this.container = container;
        this.camera = camera;
        this.renderer = renderer;
        this.useDevicePixelRatio = useDevicePixelRatio;
        
        this.resize();

        this.onResizeCallback = null;
    }

    resize( additional, sizeMultiplier = 1.0 ) {
        //const width = this.container.width;
        //const height = this.container.height;
        const width = sizeMultiplier * this.container.clientWidth;
        const height = sizeMultiplier * this.container.clientHeight;

        // Fetch the current size
        const currentSize = this.renderer.getSize(new THREE.Vector2());

        // And calculate the new size
        const newSize = new THREE.Vector2(width, height);
        // ... possibly using the device pixel ratio
        if(this.useDevicePixelRatio) newSize.multiplyScalar(window.devicePixelRatio);

        // Check if the size has actually been updated
        if(currentSize.equals(newSize)) return;
        
        // Update canvas size
        this.renderer.setSize( newSize.x, newSize.y, false );

        // Update additional objects
        if( additional ) additional.forEach( object => {
            if( object && (typeof object.setSize === "function") ) {
                object.setSize( newSize.x, newSize.y );
            }
        });

        // Update camera aspect ratio
        this.camera.aspect = newSize.x / newSize.y;
        this.camera.updateProjectionMatrix();

        // On resize callback
        if(typeof this.onResizeCallback === "function") {
            this.onResizeCallback(newSize.x, newSize.y);
        }
    }

    onResize(callback) {
        this.onResizeCallback = callback;
    }

};

export { Resizer };