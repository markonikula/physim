import { SimObject } from "./SimObject.js";
import { Solver } from "./Solver.js";
import { SimData } from "./SimData.js";
import { Vector3d } from "./Vector3d.js";
import { Logger } from './Logger.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';

const logger = new Logger();
const RADIUS = 12;
const CONTAINER_RADIUS = Math.min(window.innerWidth, window.innerHeight) / 2;
const OBJECT_COLOR = "#55dd55";
const OBJECT_COUNT = 10000;
const INITIAL_VELOCITY = RADIUS * 10;
const INITIAL_X = window.innerWidth * 0.48;
const INITIAL_Y = window.innerHeight * 0.7;
const INITIAL_Z = window.innerHeight * 0.5;
const DT = 0.05;

const objects = new SimData(OBJECT_COUNT, RADIUS);
const solver = new Solver(objects, window.innerWidth, window.innerHeight, window.innerHeight);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

const geometry = new THREE.SphereGeometry(RADIUS);
const material = new THREE.MeshLambertMaterial({ color: 'green' });
const mesh = new THREE.InstancedMesh( geometry, material, OBJECT_COUNT );
mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
scene.add( mesh );

const dummy = new THREE.Object3D();


function drawObjects() {
    objects.forEach((data, index) => {
        dummy.position.set(
            data.getX(index) - solver.width/2,
            data.getY(index) - solver.height/2,
            data.getZ(index) - solver.depth/2
        );
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
}

// From https://mika-s.github.io/javascript/random/normal-distributed/2019/05/15/generating-normally-distributed-random-numbers-in-javascript.html
function boxMullerTransform() {
    const u1 = Math.random();
    const u2 = Math.random();
    
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
    
    return { z0, z1 };
}

function createObjects() {
    for (var i = 0; i < OBJECT_COUNT; i++) {
        //const color = `hsl(${i % 360}, 80%, 50%)`;
        //const { z0: gaussian, z1: _ } = boxMullerTransform();
        const radius = RADIUS; //Math.max(RADIUS / 2, RADIUS * gaussian * 0.5 + RADIUS);
        objects.setX(i, INITIAL_X + Math.random() * 100);
        objects.setY(i, INITIAL_Y + Math.random() * 100);
        objects.setZ(i, INITIAL_Z + Math.random() * 100);
        objects.setVelocityX(i, INITIAL_VELOCITY * Math.cos(i * 0.1));
        objects.setVelocityY(i, INITIAL_VELOCITY * Math.sin(i * 0.1));
        objects.setVelocityZ(i, INITIAL_VELOCITY * Math.sin(i * 0.1));
    }
}

var iteration = 0;

function loop() {
    requestAnimationFrame(loop);

    const t1 = Date.now();
    solver.update(DT, iteration++);
    const t2 = Date.now();
    drawObjects();
    renderer.render(scene, camera);
    const t3 = Date.now();
    logger.log(`${OBJECT_COUNT} objects, solver ${t2 - t1} ms, drawing ${t3 - t2} ms`);
}

function init() {
    console.log("Init");

    createObjects();

    document.body.appendChild(renderer.domElement);
    camera.position.z = 1000;

    const geometry = new THREE.BoxGeometry(solver.width, solver.height, solver.depth); 
    const edges = new THREE.EdgesGeometry(geometry); 
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) ); 
    scene.add( line );

    const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1.0);
    scene.add( light );

    const pointLight = new THREE.PointLight( 0xffffff, 50, 0, 0 );
    pointLight.position.set( solver.width / 2, solver.height * 2, solver.depth / 3 );
    scene.add( pointLight );

    camera.position.set(solver.width / 2, solver.height / 2, solver.depth * 1.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    loop();
}

init();
