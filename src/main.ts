import { SimObject } from "./SimObject.js";
import { Solver } from "./Solver.js";
import { Vector2d } from "./Vector2d.js";

const RADIUS = 6;
const CONTAINER_RADIUS = Math.min(window.innerWidth, window.innerHeight) / 2;
const OBJECT_COLOR = "#55dd55";
const OBJECT_COUNT = 2000;
const INITIAL_VELOCITY = RADIUS * 10;
const INITIAL_X = window.innerWidth * 0.48;
const INITIAL_Y = window.innerHeight * 0.3;
const DT = 0.1;

const objects = [];

const solver = new Solver(objects, window.innerWidth, window.innerHeight);

function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
}

function drawObjects(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach(obj => drawCircle(ctx, obj.position.x, obj.position.y, obj.radius, obj.color));
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
    if (objects.length < OBJECT_COUNT) {
        const velocity = new Vector2d(
            INITIAL_VELOCITY * Math.cos(objects.length * 0.1), 
            INITIAL_VELOCITY * Math.sin(objects.length * 0.1)
        );
        const color = `hsl(${objects.length % 360}, 80%, 50%)`;
        const { z0: gaussian, z1: _ } = boxMullerTransform();
        const radius = Math.max(RADIUS / 2, RADIUS * gaussian * 0.5 + RADIUS);
        objects.push(
            new SimObject(new Vector2d(INITIAL_X, INITIAL_Y), velocity, radius, color)
        );
    }

    var canvas = document.getElementById("canvas")! as HTMLCanvasElement;
    const t1 = Date.now();
    solver.update(DT);
    const t2 = Date.now();
    drawObjects(canvas);
    const t3 = Date.now();
    console.log(`${objects.length} objects, solver ${t2 - t1} ms, drawing ${t3 - t2} ms`);
}

function init() {
    console.log("Init");
    var canvas = document.getElementById("canvas")! as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    setInterval(loop, 5);
}

init();
