import { ProximityGrid } from "./ProximityGrid";
import { SimData } from "./SimData";
import * as THREE from 'three';

class GpuSolver {
    objects: SimData;
    textureW: number;
    textureH: number;
    width: number;
    height: number;
    depth: number;
    targets;
    posTarget;
    velTarget;
    scene: THREE.Scene = new THREE.Scene();
    camera: THREE.Camera;
    material;
    renderer;
    posSourceTexture;
    velSourceTexture;
    posTargetTexture;
    velTargetTexture;

    constructor(objects: SimData, width, height, depth, dt) {
        this.objects = objects;
        this.textureW = this.objects.count / 100;
        this.textureH = 100;
        this.width = width;
        this.height = height;
        this.depth = depth;

        this.targets = new THREE.WebGLMultipleRenderTargets(this.textureW, this.textureH, 2);

        const options: any = {format: THREE.RGBAFormat, type: THREE.FloatType};
        const image: any = { width: this.textureW, height: this.textureH };
        this.posTargetTexture = this.targets.texture[0] = new THREE.Texture(
            image, 
            options.mapping, options.wrapS, options.wrapT, options.magFilter, options.minFilter, options.format, options.type, options.anisotropy, options.colorSpace
        );
        this.posTargetTexture.name = 'posTarget';
        this.velTargetTexture = this.targets.texture[1] = new THREE.Texture(
            image, 
            options.mapping, options.wrapS, options.wrapT, options.magFilter, options.minFilter, options.format, options.type, options.anisotropy, options.colorSpace
        );
        this.velTargetTexture.name = 'velTarget';

        this.camera = new THREE.OrthographicCamera(
            -this.textureW / 2, 
            this.textureW / 2, 
            this.textureH / 2,
            -this.textureH / 2,
            -10000, 
            10000
        );

        const n = this.objects.count * 4;
        this.posSourceTexture = new THREE.DataTexture( this.objects.pos, this.textureW, this.textureH, THREE.RGBAFormat, THREE.FloatType );
        this.posSourceTexture.needsUpdate = true;
        this.velSourceTexture = new THREE.DataTexture( this.objects.vel, this.textureW, this.textureH, THREE.RGBAFormat, THREE.FloatType );
        this.velSourceTexture.needsUpdate = true;

        const uniforms = {
            count: { value: objects.count },
            radius: { value: objects.radius },
            dt: { value: dt },
            textureW: { value: this.textureW },
            textureH: { value: this.textureH },
            positions: { value: this.posSourceTexture },
            velocities: { value: this.velSourceTexture },
            //proximityGrid: { value: null }
        };
        this.material = new THREE.RawShaderMaterial({
            uniforms: uniforms,
            vertexShader: document.getElementById('vertexShader_solver').textContent,
            fragmentShader: document.getElementById('fragmentShader_solver').textContent,
            depthWrite: false,
            glslVersion: THREE.GLSL3
        });

        const plane = new THREE.PlaneGeometry(this.textureW, this.textureH);
        const quad = new THREE.Mesh(plane, this.material);
        quad.position.z = -100;
        this.scene.add(quad);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setRenderTarget(this.targets);
    }

    solve(dt: number, iteration: number) {
        /*
        const pg = new ProximityGrid(this.objects, 2.01);
        const pairs: Array<Array<number>> = [];
        pg.forEachCandidatePair((obj1, obj2) => {
            (pairs[obj1] ||= []).push(obj2);
        });
        const pairArray = [];
        pairs.forEach((xxx, i) => {

        });
        */

        this.posSourceTexture.needsUpdate = true;
        this.velSourceTexture.needsUpdate = true;
        this.renderer.render(this.scene, this.camera);

        const context = this.renderer.getContext();
        const utils = new THREE.WebGLUtils( context, {}, {} );
        context.readBuffer(context.COLOR_ATTACHMENT0);
        context.readPixels( 0, 0, this.textureW, this.textureH, utils.convert(this.posTargetTexture.format), utils.convert(this.posTargetTexture.type), this.objects.pos );
        context.readBuffer(context.COLOR_ATTACHMENT1);
        context.readPixels( 0, 0, this.textureW, this.textureH, utils.convert(this.posTargetTexture.format), utils.convert(this.posTargetTexture.type), this.objects.vel );
    }
}

export { GpuSolver };
