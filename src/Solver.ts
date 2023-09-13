import { Vector3d } from "./Vector3d.js";
import { SimObject } from "./SimObject.js";
import { ProximityGrid } from "./ProximityGrid.js";

const GRAVITY = new Vector3d(0, -100.0, 0.0);
const WALL_DAMPENING = 0.8;
const POSITIONAL_CORRECTION = 0.1;
const RESTITUTION = 0.8;
const DRAG = 0.998;

class Solver {
    objects: Array<SimObject>;
    width: number;
    height: number;
    depth: number;

    constructor(objects: Array<SimObject>, width, height, depth) {
        this.objects = objects;
        this.width = width;
        this.height = height;
        this.depth = depth;
    }

    update(dt: number) {
        this.applyGravity();
        this.applyDrag();
        this.applyWallConstraints();
        this.solveCollisions();
        this.updatePositions(dt);
    }

    updatePositions(dt: number) {
        this.objects.forEach(obj => obj.updatePosition(dt));
    }

    applyGravity() {
        this.objects.forEach(obj => obj.accelerate(GRAVITY));
    }

    applyDrag() {
        this.objects.forEach(obj => obj.velocity.scaleInPlace(DRAG));
    }

    applyWallConstraints() {
        this.objects.forEach(obj => {
            if (obj.position.x - obj.radius < 0) {
                obj.position.x = obj.radius;
                obj.velocity.x = -obj.velocity.x * WALL_DAMPENING;
            }
            if (obj.position.x + obj.radius > this.width) {
                obj.position.x = this.width - obj.radius;
                obj.velocity.x = -obj.velocity.x * WALL_DAMPENING;
            }
            if (obj.position.y - obj.radius < 0) {
                obj.position.y = obj.radius;
                obj.velocity.y = -obj.velocity.y * WALL_DAMPENING;
            }
            if (obj.position.y + obj.radius > this.height) {
                obj.position.y = this.height - obj.radius;
                obj.velocity.y = -obj.velocity.y * WALL_DAMPENING;
            }
            if (obj.position.z - obj.radius < 0) {
                obj.position.z = obj.radius;
                obj.velocity.z = -obj.velocity.z * WALL_DAMPENING;
            }
            if (obj.position.z + obj.radius > this.height) {
                obj.position.z = this.depth - obj.radius;
                obj.velocity.z = -obj.velocity.z * WALL_DAMPENING;
            }
        });
    }

    solveCollisions() {
       const pg = new ProximityGrid(this.objects);
       pg.forEachCandidatePair((obj1, obj2) => this.solvePair(obj1, obj2));
    }

    solvePair(obj1: SimObject, obj2: SimObject) {
        if (!obj1 || !obj2) return;

        const axis = obj1.position.minus(obj2.position);
        const dist = axis.length();
        const minDist = obj1.radius + obj2.radius;
        if (dist < minDist) {
            const normal = axis.scale(1 / dist);
            // Adapted from https://code.tutsplus.com/how-to-create-a-custom-2d-physics-engine-the-basics-and-impulse-resolution--gamedev-6331t
            // Calculate relative velocity 
            const rv = obj1.velocity.minus(obj2.velocity);
            // Calculate relative velocity in terms of the normal direction 
            const velocityAlongNormal = rv.dotProduct(normal);
            // Do not resolve if velocities are separating
            if (velocityAlongNormal <= 0) {
                // Calculate impulse scale
                const impulseScale = (-(1 + RESTITUTION) * velocityAlongNormal) / (obj1.inverseOfMass + obj2.inverseOfMass);
                // Apply impulse 
                const impulse = normal.scale(impulseScale);
                obj1.velocity = obj1.velocity.add(impulse.scale(obj1.inverseOfMass));
                obj2.velocity = obj2.velocity.minus(impulse.scale(obj2.inverseOfMass));
            }

            // Apply positional correction
            const delta = minDist - dist;
            obj1.position = obj1.position.add(normal.scale(POSITIONAL_CORRECTION * delta));
            obj2.position = obj2.position.minus(normal.scale(POSITIONAL_CORRECTION * delta));
        }
    }
}

export { Solver };
