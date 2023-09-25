import { Vector3d } from "./Vector3d.js";
import { SimObject } from "./SimObject.js";
import { ProximityGrid } from "./ProximityGrid.js";
import { SimData, GRAVITY } from "./SimData.js";

//const GRAVITY = new Vector3d(0, -10.0, 0.0);
const WALL_DAMPENING = 0.3;
const POSITIONAL_CORRECTION = 0.1;
const RESTITUTION = 0.9;
const COHESION_DISTANCE_FACTOR = 2.0;
const COLLISIONS = true;
const COHESION = false;
const COHESION_SCALE = 0.5;
const BOUNCING_X_WALL = false;
const BOWL = false;
const BOWL_RADIUS = window.innerHeight * 2.0;
const HOLE = true;


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
        this.objects.updatePositions(dt);
        this.applyWallConstraints(dt, iteration);
        //this.solveCollisions(iteration);
    }

    applyWallConstraints(dt, iteration: number) {
        if (BOWL) {
            this.applyBowlConstraints(dt, iteration);
        } else {
            this.applyBoxConstraints(dt, iteration);
        }
    }

    applyBowlConstraints(dt, iteration: number) {
        const bowlRadiusSquared = BOWL_RADIUS ** 2;
        this.objects.forEach((data, i) => {
            const x = data.getX(i) - this.width/2;
            const y = data.getY(i) - this.height/2;
            const z = data.getZ(i) - this.depth/2;
            const distSquared = x ** 2 + y ** 2 + z ** 2;

            /*
            if (Math.abs(x) < BOWL_RADIUS * 0.05 &&
                Math.abs(z) < BOWL_RADIUS * 0.05 &&
                y < -BOWL_RADIUS * 0.99) {
                data.setX(i, -BOWL_RADIUS * 0.7 + this.width/2);
                data.setY(i, BOWL_RADIUS * 2 + this.height/2);
                data.setZ(i, -BOWL_RADIUS * 0.5 + this.depth/2);
                data.setVelocityX(i, 0);
                data.setVelocityY(i, 0);
                data.setVelocityZ(i, 0);
                return;
            }
            */

            if (y < 0 && distSquared > bowlRadiusSquared) {
                const dist = Math.sqrt(distSquared);
                const scale = BOWL_RADIUS / dist;
                data.setX(i, x * scale + this.width/2);
                data.setY(i, y * scale + this.height/2);
                data.setZ(i, z * scale + this.depth/2);

                const normalX = -x / dist;
                const normalY = -y / dist;
                const normalZ = -z / dist;

                const velX = data.getVelocityX(i);
                const velY = data.getVelocityY(i);
                const velZ = data.getVelocityZ(i);
                const velAlongNormal = velX * normalX + velY * normalY + velZ * normalZ;
                const impulseScale = -velAlongNormal * WALL_DAMPENING;
                const impulseX = normalX * impulseScale;
                const impulseY = normalY * impulseScale;
                const impulseZ = normalZ * impulseScale;
                data.setVelocityX(i, velX + impulseX);
                data.setVelocityY(i, velY + impulseY);
                data.setVelocityZ(i, velZ + impulseZ);
            }
        });
    }

    applyBoxConstraints(dt, iteration: number) {
        const xWall = 0;
        this.objects.forEach((data, i) => {
            const inDropZone = HOLE && data.getX(i) + data.getRadius(i) > this.width * 0.8;
            if (data.getY(i) - data.getRadius(i) < -this.height * 0.5) {
                data.setX(i, this.width * 0.1 + Math.random() * 10.0);
                data.setY(i, this.height * 0.6);
                data.setZ(i, (data.getZ(i) - this.depth/2) * 0.1 + this.depth/2);
                data.setVelocityX(i, -GRAVITY * dt * 2);
                data.setVelocityY(i, GRAVITY * dt * 2);
                data.setVelocityZ(i, 0);
                return;
            }

            if (data.getX(i) - data.getRadius(i) < xWall) {
                data.setX(i, data.getRadius(i) + xWall);
                data.setVelocityX(i, -data.getVelocityX(i) * WALL_DAMPENING);
                if (BOUNCING_X_WALL) {
                    data.setVelocityX(i, data.getVelocityX(i) + Math.random() * 200);
                    data.setVelocityY(i, data.getVelocityY(i) + Math.random() * 10);
                }
            }
            if (data.getX(i) + data.getRadius(i) > this.width) {
                data.setX(i, this.width - data.getRadius(i));
                data.setVelocityX(i, -data.getVelocityX(i) * WALL_DAMPENING);
            }
            if (!inDropZone && data.getY(i) - data.getRadius(i) < 0) {
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
            if (data.getZ(i) + data.getRadius(i) > this.depth) {
                data.setZ(i, this.depth - data.getRadius(i));
                data.setVelocityZ(i, -data.getVelocityZ(i) * WALL_DAMPENING);
            }
        });
    }

    solveCollisions(iteration: number) {
        const pg = new ProximityGrid(
            this.objects,
            COLLISIONS ? 2.01 : (COHESION_DISTANCE_FACTOR * 1.01)
        );
        //if (iteration % 100 == 0) {
        //    this.objects.optimizeLocality(pg);
        //}
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
        if (COLLISIONS && distSquared < minDist ** 2) {
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

        const cohesionMaxDist = minDist * COHESION_DISTANCE_FACTOR;
        if (COHESION && distSquared < cohesionMaxDist ** 2) {
            const dist = Math.sqrt(distSquared);
            //const factor = 1.0 - (dist / cohesionMaxDist);  // 0 at boundary, 1 when fully overlapping
            //const scale = -((factor * 1.2) ** 2); //Math.sin((factor ** 4) * Math.PI * 1.5);

            //var scale = -Math.sin((factor ** 4) * Math.PI * 1.5);
            //if (scale > 0) scale *= 20.5;

            var scale;
            if (dist < minDist * 0.5) {
                scale = -((1 - (dist / (minDist * 0.5))) ** 2);
            } else {
                scale = Math.sin(((dist - minDist) / (minDist * 0.5)) * Math.PI);
            }

            const normalX = axisX / dist;
            const normalY = axisY / dist;
            const normalZ = axisZ / dist;
            const impulseX = normalX * COHESION_SCALE * scale;
            const impulseY = normalY * COHESION_SCALE * scale;
            const impulseZ = normalZ * COHESION_SCALE * scale;
            data.setVelocityX(obj1, data.getVelocityX(obj1) - impulseX);
            data.setVelocityY(obj1, data.getVelocityY(obj1) - impulseY);
            data.setVelocityZ(obj1, data.getVelocityZ(obj1) - impulseZ);
            data.setVelocityX(obj2, data.getVelocityX(obj2) + impulseX);
            data.setVelocityY(obj2, data.getVelocityY(obj2) + impulseY);
            data.setVelocityZ(obj2, data.getVelocityZ(obj2) + impulseZ);
        }
    }
}

export { Solver };
