import { Vector2d } from "./Vector2d.js";
import { SimObject } from "./SimObject.js";

const GRAVITY = new Vector2d(0, 2.0);
const WALL_DAMPENING = 0.99;
const POSITIONAL_CORRECTION = 0.1;
const RESTITUTION = 0.98;
const DRAG = 0.999;

class Solver {
    objects: Array<SimObject>;
    width: number;
    height: number;

    constructor(objects: Array<SimObject>, width, height) {
        this.objects = objects;
        this.width = width;
        this.height = height;
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
        });
    }

    solveCollisions() {
        const n = this.objects.length;
        for (var i = 0; i < n - 1; i++) {
            for (var j = i + 1; j < n; j++) {
                const obj1 = this.objects[i];
                const obj2 = this.objects[j];
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
    }
}

export { Solver };
