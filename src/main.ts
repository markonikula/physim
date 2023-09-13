import { SimObject } from "./SimObject.js";
import { Solver } from "./Solver.js";
import { Vector3d } from "./Vector3d.js";
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';

const RADIUS = 20;
const CONTAINER_RADIUS = Math.min(window.innerWidth, window.innerHeight) / 2;
const OBJECT_COLOR = "#55dd55";
const OBJECT_COUNT = 2000;
const INITIAL_VELOCITY = RADIUS * 10;
const INITIAL_X = window.innerWidth * 0.48;
const INITIAL_Y = window.innerHeight * 0.7;
const INITIAL_Z = window.innerHeight * 0.5;
const DT = 0.1;

const objects = [];
const solver = new Solver(objects, window.innerWidth, window.innerHeight, window.innerHeight);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );


function drawObjects() {
    objects.forEach(obj => {
        if (!obj.target) {
            const geometry = new THREE.SphereGeometry(obj.radius);
            const material = new THREE.MeshPhongMaterial({ color: obj.color });
            const sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere, );
            obj.target = sphere;
        }
        obj.target.position.set(
            obj.position.x - solver.width / 2, 
            obj.position.y - solver.height / 2, 
            obj.position.z - solver.depth / 2
        );
    });
}

// From https://mika-s.github.io/javascript/random/normal-distributed/2019/05/15/generating-normally-distributed-random-numbers-in-javascript.html
function boxMullerTransform() {
    const u1 = Math.random();
    const u2 = Math.random();
    
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
    
    return { z0, z1 };
}

function loop() {
    requestAnimationFrame(loop);

    if (objects.length < OBJECT_COUNT) {
        const velocity = new Vector3d(
            INITIAL_VELOCITY * Math.cos(objects.length * 0.1), 
            INITIAL_VELOCITY * Math.sin(objects.length * 0.1),
            INITIAL_VELOCITY * Math.sin(objects.length * 0.1)
        );
        const color = `hsl(${objects.length % 360}, 80%, 50%)`;
        const { z0: gaussian, z1: _ } = boxMullerTransform();
        const radius = Math.max(RADIUS / 2, RADIUS * gaussian * 0.5 + RADIUS);
        objects.push(
            new SimObject(new Vector3d(INITIAL_X, INITIAL_Y, INITIAL_Z), velocity, radius, color)
        );
    }

    const t1 = Date.now();
    solver.update(DT);
    const t2 = Date.now();
    drawObjects();
    renderer.render(scene, camera);
    const t3 = Date.now();
    console.log(`${objects.length} objects, solver ${t2 - t1} ms, drawing ${t3 - t2} ms`);
}

function init() {
    console.log("Init");

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
