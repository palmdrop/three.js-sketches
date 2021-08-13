import * as THREE from 'three';

export const textureToImage = ( texture ) => {
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true,
    });

    const width = texture.image.width;
    const height = texture.image.height;
    const proportions = width / height;

    renderer.setSize(width, height, false);

    const camera = 
    new THREE.OrthographicCamera(
        -proportions / 2, proportions / 2, // Left/right
        0.5, -0.5,  // Top/bottom
        0.01, 10 // Near/far
    );
    camera.position.set(0, 0, 1);

    const geometry = new THREE.PlaneGeometry(proportions, 1);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x332211,
        map: texture,
    })
    const mesh = new THREE.Mesh(
        geometry,
        material
        //new THREE.MeshBasicMaterial({ map: texture })
    );
    material.needsUpdate = true;
    mesh.needsUpdate = true;

    const light = new THREE.PointLight("#ffffff", 10, 10, 2);
    light.position.set(0.5, 0.0, 2);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#ff0000");
    scene.add( mesh, light );

    renderer.render( scene, camera );
    renderer.render( scene, camera );
    renderer.render( scene, camera );

    return renderer.domElement.toDataURL();
}
