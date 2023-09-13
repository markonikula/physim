import { Vector2d } from "./Vector2d.js";

class SimObject {
    position: Vector2d;
    velocity: Vector2d;
    acceleration: Vector2d;
    radius: number;
    color: string;
    inverseOfMass: number;

    constructor(position: Vector2d, velocity: Vector2d, radius: number, color: string) {
        this.position = position;
        this.velocity = velocity;
        this.acceleration = new Vector2d(0, 0);
        this.radius = radius;
        this.color = color;
        this.inverseOfMass = 1 / (Math.PI * radius * radius);
    }

    updatePosition(dt: number) {
        // Velocity Verlet integration
        this.position = this.position.add(this.velocity.scale(dt)).add(this.acceleration.scale(0.5 * dt * dt));
        this.velocity = this.velocity.add(this.acceleration.scale(dt));
        this.acceleration.x = 0;
        this.acceleration.y = 0;
    }

    accelerate(acc: Vector2d) {
        this.acceleration = this.acceleration.add(acc);
    }
}

export { SimObject };
