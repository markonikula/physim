import { Vector2d } from "./Vector2d.js";

class SimObject {
    position: Vector2d;
    oldPosition: Vector2d;
    acceleration: Vector2d;
    radius: number;

    constructor(position: Vector2d, radius: number) {
        this.position = position;
        this.oldPosition = position;
        this.acceleration = new Vector2d(0, 0);
        this.radius = radius;
    }

    updatePosition(dt: number) {
        const velocity = this.position.minus(this.oldPosition)
        this.oldPosition = this.position;
        this.position = this.position.add(velocity).add(this.acceleration.scale(dt * dt));
        this.acceleration = new Vector2d(0, 0);
    }

    accelerate(acc: Vector2d) {
        this.acceleration = this.acceleration.add(acc);
    }
}

export { SimObject };
