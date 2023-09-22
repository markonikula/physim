import { ProximityGrid } from "./ProximityGrid";

const VALUES = 3;
const GRAVITY = -300;
const DRAG = 0.999;

class SimData {
    count: number;
    radius: number;
    pos: Float64Array;
    vel: Float64Array;

    constructor(count, radius) {
        this.count = count;
        this.radius = radius;
        this.pos = new Float64Array(count * VALUES);
        this.vel = new Float64Array(count * VALUES);
    }

    forEach(func: ((data: SimData, index: number) => void)) {
        for (var i = 0; i < this.count; i++) {
            func(this, i);
        }
    }

    optimizeLocality(grid: ProximityGrid) {
        const newPos = new Float64Array(this.count * VALUES);
        const newVel = new Float64Array(this.count * VALUES);
        var i = 0;
        grid.forEach(index => {
            newPos[i] = this.pos[index * VALUES];
            newPos[i + 1] = this.pos[index * VALUES + 1];
            newPos[i + 2] = this.pos[index * VALUES + 2];
            newVel[i] = this.vel[index * VALUES];
            newVel[i + 1] = this.vel[index * VALUES + 1];
            newVel[i + 2] = this.vel[index * VALUES + 2];
            i += VALUES;
        });
        this.pos = newPos;
        this.vel = newVel;
    }

    updatePositions(dt: number) {
        // Velocity Verlet integration
        for (var i = 0; i < this.count * VALUES; i++) {
            this.pos[i] += this.vel[i] * dt;
            this.vel[i] *= DRAG;
        }
        // Apply gravity to Y position and velocity
        const gravityPosAddition = GRAVITY * 0.5 * dt * dt;
        const gravityVelAddition = GRAVITY * dt;
        for (var i = 1; i < this.count * VALUES; i += VALUES) {
            this.pos[i] += gravityPosAddition;
            this.vel[i] += gravityVelAddition;
        }
    }

    getRadius(index: number) {
        return this.radius;
    }

    getX(index) {
        return this.pos[index * VALUES];
    }

    getY(index) {
        return this.pos[index * VALUES + 1];
    }

    getZ(index) {
        return this.pos[index * VALUES + 2];
    }

    getVelocityX(index) {
        return this.vel[index * VALUES];
    }

    getVelocityY(index) {
        return this.vel[index * VALUES + 1];
    }

    getVelocityZ(index) {
        return this.vel[index * VALUES + 2];
    }

    setX(index, value) {
        this.pos[index * VALUES] = value;
    }

    setY(index, value) {
        this.pos[index * VALUES + 1] = value;
    }

    setZ(index, value) {
        this.pos[index * VALUES + 2] = value;
    }

    setVelocityX(index, value) {
        this.vel[index * VALUES] = value;
    }

    setVelocityY(index, value) {
        this.vel[index * VALUES + 1] = value;
    }

    setVelocityZ(index, value) {
        this.vel[index * VALUES + 2] = value;
    }
}

export { SimData, GRAVITY };
