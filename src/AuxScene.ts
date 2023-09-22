import * as THREE from 'three';

class AuxScene {
    scene: THREE.Scene = new THREE.Scene();
    camera: THREE.Camera = new THREE.OrthographicCamera(
        window.innerWidth / - 2, 
        window.innerWidth / 2, 
        window.innerHeight / 2,
        window.innerHeight / - 2,
        -10000, 
        10000
    );
    buffer: THREE.WebGLRenderTarget;
    uniforms: any;

    constructor(vertexShaderName: string, fragmentShaderName: string, parameters = {}) {
        const light1 = new THREE.DirectionalLight(0xffffff, 3);
        light1.position.set(0, 0, 1).normalize();
        this.scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xffd5d5, 4.5);
        light2.position.set(0, 0, - 1).normalize();
        this.scene.add(light2);

        this.camera.position.z = 100;

        this.buffer = new THREE.WebGLRenderTarget(
            window.innerWidth,
            window.innerHeight,
            { format: THREE.RGBAFormat, type: THREE.FloatType }
        );
        this.buffer.depthBuffer = true;
        this.buffer.depthTexture = new THREE.DepthTexture(window.innerWidth, window.innerHeight);

        this.uniforms = { buffer: { value: this.buffer.texture }, ...parameters };
        //console.log(uniforms);
        const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: document.getElementById(vertexShaderName).textContent,
            fragmentShader: document.getElementById(fragmentShaderName).textContent,
            //vertexShader: document.getElementById('vertexShader_screen').textContent,
            //fragmentShader: document.getElementById('fragmentShader_screen').textContent,
            depthWrite: false
        });

        const plane = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);

        const quad = new THREE.Mesh(plane, material);
        quad.position.z = -100;
        this.scene.add(quad);
    }
}

export { AuxScene };
