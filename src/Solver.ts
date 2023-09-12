import { Vector2d } from "./Vector2d.js";
import { SimObject } from "./SimObject.js";

const GRAVITY = new Vector2d(0, 1.0);

class Solver {
    objects: Array<SimObject>;
    container: SimObject;

    constructor(objects: Array<SimObject>, container: SimObject) {
        this.objects = objects;
        this.container = container;
    }

    update(dt: number) {
        this.applyGravity();
        this.applyConstraints();
        this.solveCollisions();
        this.updatePositions(dt);
    }

    updatePositions(dt: number) {
        this.objects.forEach(obj => obj.updatePosition(dt));
    }

    applyGravity() {
        this.objects.forEach(obj => obj.accelerate(GRAVITY));
    }

    applyConstraints() {
        this.objects.forEach(obj => {
            const diff = obj.position.minus(this.container.position);
            const dist = diff.length();
            if (dist > this.container.radius - obj.radius) {
                const n = diff.scale(1 / dist);
                obj.position = this.container.position.add(n.scale(this.container.radius - obj.radius));
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
                    const n = axis.scale(1 / dist);
                    const delta = minDist - dist;
                    obj1.position = obj1.position.add(n.scale(0.5 * delta));
                    obj2.position = obj2.position.minus(n.scale(0.5 * delta));
                }
            }
        }
    }
}

export { Solver };
