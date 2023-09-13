import { Vector3d } from "./Vector3d.js";

class SimObject {
    position: Vector3d;
    velocity: Vector3d;
    acceleration: Vector3d;
    radius: number;
    color: string;
    inverseOfMass: number;
    target: object;

    constructor(position: Vector3d, velocity: Vector3d, radius: number, color: string) {
        this.position = position;
        this.velocity = velocity;
        this.acceleration = new Vector3d(0, 0, 0);
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
        this.acceleration.z = 0;
    }

    accelerate(acc: Vector3d) {
        this.acceleration = this.acceleration.add(acc);
    }
}

export { SimObject };
