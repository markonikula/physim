import { SimObject } from "./SimObject.js";
import { Solver } from "./Solver.js";
import { Vector2d } from "./Vector2d.js";

const RADIUS = 5;
const CONTAINER_RADIUS = Math.min(window.innerWidth, window.innerHeight) / 2;
const OBJECT_COLOR = "#55dd55";
const OBJECT_COUNT = 500;
const INITIAL_X = window.innerWidth * 0.48;
const INITIAL_Y = window.innerHeight * 0.3;
const DT = 0.1;

const container = new SimObject(new Vector2d(window.innerWidth / 2, window.innerHeight / 2), CONTAINER_RADIUS);

console.log("Start");

const objects = [
    new SimObject(new Vector2d(INITIAL_X, INITIAL_Y), RADIUS)
];
const solver = new Solver(objects, container);

function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
}

function drawObjects(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCircle(ctx, container.position.x, container.position.y, container.radius, "white");
    objects.forEach(obj => drawCircle(ctx, obj.position.x, obj.position.y, obj.radius, OBJECT_COLOR));
}

function loop() {
    if (objects.length < OBJECT_COUNT) {
        objects.push(
            new SimObject(new Vector2d(INITIAL_X, INITIAL_Y), RADIUS * Math.random() + RADIUS / 2)
        );
    }

    var canvas = document.getElementById("canvas")! as HTMLCanvasElement;
    solver.update(DT);
    drawObjects(canvas);
}

function init() {
    console.log("Init");
    var canvas = document.getElementById("canvas")! as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    setInterval(loop, 10);
}

init();
