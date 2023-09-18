const VALUES = 6;
const GRAVITY = -100;
const DRAG = 0.998;

class SimData {
    count: number;
    radius: number;
    data: Array<number>;

    constructor(count, radius) {
        this.count = count;
        this.radius = radius;
        this.data = [];
    }

    forEach(func: ((data: SimData, index: number) => void)) {
        for (var i = 0; i < this.count; i++) {
            func(this, i);
        }
    }

    updatePosition(index, dt: number) {
        // Velocity Verlet integration
        this.setX(index, this.getX(index) + this.getVelocityX(index) * dt);
        this.setY(index, this.getY(index) + this.getVelocityY(index) * dt + GRAVITY * 0.5 * dt * dt);
        this.setZ(index, this.getZ(index) + this.getVelocityZ(index) * dt);
        this.setVelocityY(index, this.getVelocityY(index) + GRAVITY * dt);

        // Apply drag
        this.setVelocityX(index, this.getVelocityX(index) * DRAG);
        this.setVelocityY(index, this.getVelocityY(index) * DRAG);
        this.setVelocityZ(index, this.getVelocityZ(index) * DRAG);
    }

    getRadius(index: number) {
        return this.radius;
    }

    getX(index) {
        return this.data[index * VALUES];
    }

    getY(index) {
        return this.data[index * VALUES + 1];
    }

    getZ(index) {
        return this.data[index * VALUES + 2];
    }

    getVelocityX(index) {
        return this.data[index * VALUES + 3];
    }

    getVelocityY(index) {
        return this.data[index * VALUES + 4];
    }

    getVelocityZ(index) {
        return this.data[index * VALUES + 5];
    }

    setX(index, value) {
        this.data[index * VALUES] = value;
    }

    setY(index, value) {
        this.data[index * VALUES + 1] = value;
    }

    setZ(index, value) {
        this.data[index * VALUES + 2] = value;
    }

    setVelocityX(index, value) {
        this.data[index * VALUES + 3] = value;
    }

    setVelocityY(index, value) {
        this.data[index * VALUES + 4] = value;
    }

    setVelocityZ(index, value) {
        this.data[index * VALUES + 5] = value;
    }
}

export { SimData, GRAVITY };
