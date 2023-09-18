import { Vector3d } from "./Vector3d.js";
import { SimObject } from "./SimObject.js";
import { ProximityGrid } from "./ProximityGrid.js";
import { SimData, GRAVITY } from "./SimData.js";

//const GRAVITY = new Vector3d(0, -10.0, 0.0);
const WALL_DAMPENING = 0.8;
const POSITIONAL_CORRECTION = 0.1;
const RESTITUTION = 0.8;
const BOUNCING_X_WALL = false;


function computeTimeToCollision1d(distance: number, velocity: number, acceleration: number) {
    // Compute time to collision with the given speed and acceleration, along a single axis.
    if (distance <= 0) {
        return 0;
    }
    var averageVelocity = -velocity + 0.5 * Math.sqrt(2 * -acceleration * distance);
    return distance / averageVelocity;
}

class Solver {
    objects: SimData;
    width: number;
    height: number;
    depth: number;

    constructor(objects, width, height, depth) {
        this.objects = objects;
        this.width = width;
        this.height = height;
        this.depth = depth;
    }

    update(dt: number, iteration: number) {
        this.objects.forEach((data, index) => {
            data.updatePosition(index, dt);
        });
        this.applyWallConstraints(dt, iteration);
        this.solveCollisions();
    }

    applyWallConstraints(dt, iteration: number) {
        const xWall = 0;
        this.objects.forEach((data, i) => {
            if (data.getX(i) - data.getRadius(i) < xWall) {
                data.setX(i, data.getRadius(i) + xWall);
                data.setVelocityX(i, -data.getVelocityX(i) * WALL_DAMPENING);
                if (BOUNCING_X_WALL) {
                    data.setVelocityX(i, data.getVelocityX(i) + Math.random() * 2000);
                    data.setVelocityY(i, data.getVelocityY(i) + Math.random() * 500);
                }
            }
            if (data.getX(i) + data.getRadius(i) > this.width) {
                data.setX(i, this.width - data.getRadius(i));
                data.setVelocityX(i, -data.getVelocityX(i) * WALL_DAMPENING);
            }
            if (data.getY(i) - data.getRadius(i) < 0) {
                /*
                data.setY(i, data.getRadius(i));
                data.setVelocityY(i, -data.getVelocityY(i) * WALL_DAMPENING);
                */
                var previousVelocity = data.getVelocityY(i) - dt * GRAVITY;
                var previousStep = previousVelocity * dt + GRAVITY * 0.5 * dt * dt
                var previousHeight = (data.getY(i) - data.getRadius(i)) - previousStep;
                var timeToCollision = computeTimeToCollision1d(previousHeight, previousVelocity, GRAVITY);
                var collisionVelocity = previousVelocity + timeToCollision * GRAVITY;
                var bounceVelocity = -collisionVelocity * WALL_DAMPENING + (dt - timeToCollision) * GRAVITY;
                //bounceVelocity = Math.max(0, bounceVelocity);
                data.setVelocityY(i, bounceVelocity);
                data.setY(i, data.getRadius(i) + data.getVelocityY(i) * (dt - timeToCollision));
                //data.getY(i) = Math.max(0, data.getY(i));
            }
            if (data.getY(i) + data.getRadius(i) > this.height) {
                data.setY(i, this.height - data.getRadius(i));
                data.setVelocityY(i, -data.getVelocityY(i) * WALL_DAMPENING);
            }
            if (data.getZ(i) - data.getRadius(i) < 0) {
                data.setZ(i, data.getRadius(i));
                data.setVelocityZ(i, -data.getVelocityZ(i) * WALL_DAMPENING);
            }
            if (data.getZ(i) + data.getRadius(i) > this.height) {
                data.setZ(i, this.depth - data.getRadius(i));
                data.setVelocityZ(i, -data.getVelocityZ(i) * WALL_DAMPENING);
            }
        });
    }

    solveCollisions() {
       const pg = new ProximityGrid(this.objects);
       pg.forEachCandidatePair((obj1, obj2) => this.solvePair(obj1, obj2));
    }

    solvePair(obj1: number, obj2: number) {
        //if (!obj1 || !obj2) return;
        const data = this.objects;

        const axisX = data.getX(obj1) - data.getX(obj2);
        const axisY = data.getY(obj1) - data.getY(obj2);
        const axisZ = data.getZ(obj1) - data.getZ(obj2);
        const distSquared = axisX ** 2 + axisY ** 2 + axisZ ** 2;
        const minDist = data.getRadius(obj1) + data.getRadius(obj2);
        if (distSquared < minDist ** 2) {
            const dist = Math.sqrt(distSquared);
            const normalX = axisX / dist;
            const normalY = axisY / dist;
            const normalZ = axisZ / dist;
            // Adapted from https://code.tutsplus.com/how-to-create-a-custom-2d-physics-engine-the-basics-and-impulse-resolution--gamedev-6331t
            // Calculate relative velocity 
            const rvX = data.getVelocityX(obj1) - data.getVelocityX(obj2);
            const rvY = data.getVelocityY(obj1) - data.getVelocityY(obj2);
            const rvZ = data.getVelocityZ(obj1) - data.getVelocityZ(obj2);
            // Calculate relative velocity in terms of the normal direction 
            const velocityAlongNormal = rvX * normalX + rvY * normalY + rvZ * normalZ;
            // Do not resolve if velocities are separating
            if (velocityAlongNormal <= 0) {
                // Calculate impulse scale
                const impulseScale = -RESTITUTION * velocityAlongNormal;
                // Apply impulse 
                const impulseX = normalX * impulseScale;
                const impulseY = normalY * impulseScale;
                const impulseZ = normalZ * impulseScale;
                data.setVelocityX(obj1, data.getVelocityX(obj1) + impulseX);
                data.setVelocityY(obj1, data.getVelocityY(obj1) + impulseY);
                data.setVelocityZ(obj1, data.getVelocityZ(obj1) + impulseZ);
                data.setVelocityX(obj2, data.getVelocityX(obj2) - impulseX);
                data.setVelocityY(obj2, data.getVelocityY(obj2) - impulseY);
                data.setVelocityZ(obj2, data.getVelocityZ(obj2) - impulseZ);
            }

            // Apply positional correction
            const delta = minDist - dist;
            data.setX(obj1, data.getX(obj1) + normalX * delta * POSITIONAL_CORRECTION);
            data.setY(obj1, data.getY(obj1) + normalY * delta * POSITIONAL_CORRECTION);
            data.setZ(obj1, data.getZ(obj1) + normalZ * delta * POSITIONAL_CORRECTION);
            data.setX(obj2, data.getX(obj2) - normalX * delta * POSITIONAL_CORRECTION);
            data.setY(obj2, data.getY(obj2) - normalY * delta * POSITIONAL_CORRECTION);
            data.setZ(obj2, data.getZ(obj2) - normalZ * delta * POSITIONAL_CORRECTION);
        }
    }
}

export { Solver };
