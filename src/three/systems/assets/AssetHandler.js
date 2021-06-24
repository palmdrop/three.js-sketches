import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

class AssetHandler {
    constructor() {
        this.loadManager = new THREE.LoadingManager();

        this.textureLoader = new THREE.TextureLoader(this.loadManager);
        this.gltfLoader = new GLTFLoader();

        // Asset cache
        this.cache = new Map();

        // Number of assets left to load
        this.toLoad = 0;

        // Number of assets loaded
        this.loaded = 0;

        // On progress callback
        this.onProgress = null;
    }


    onLoad(onProgress, onLoad) {
        if(onLoad) this.loadManager.onLoad = onLoad;
        if(onProgress) this.onProgress = onProgress;
        return this;
    }

    _loaded(path) {
        this.loaded++;
        this.onProgress && this.onProgress(path, this.loaded, this.toLoad);
    }

    _load(path, method) {
        // If asset is already loaded, return cached instance
        if(this.cache.has(path)) {
            return this.cache.get(path);
        }

        // Increment number of assets to load
        this.toLoad++;

        // Otherwise, load asset
        const asset = method(path);

        // And add the asset to the cache
        this.cache.set(path, asset);

        // And return the final asset
        return asset;
    }

    loadTexture(path, useSRGB) {
        return this._load(path, (p) => { 
            const texture = this.textureLoader.load(p, (_) => this._loaded(path));
            if(useSRGB) texture.encoding = THREE.sRGBEncoding;
            return texture;
        });
    }

    async loadGLTF(path) {
        return this._load(path, async (p) => {
            const model = await this.gltfLoader.loadAsync(p);

            this._loaded(path);

            return model;
        });
    }

    /* loadImageHDRI(renderer, path, onLoad) {
        return this._load(path, (p) => {
            const texture = this.textureLoader.load(p, () => {
                const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
                rt.fromEquirectangularTexture(renderer, texture);

                onLoad && onLoad(rt.texture);

                return rt.texture;
            });
            this._loaded(path);
            return texture;
        });
    } */
};

const ASSETHANDLER = new AssetHandler();

export {
    ASSETHANDLER
    //AssetHandler
}
