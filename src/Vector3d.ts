class Vector3d {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(other: Vector3d) : Vector3d {
        return new Vector3d(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    minus(other: Vector3d) : Vector3d {
        return new Vector3d(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    mul(other: Vector3d) : Vector3d {
        return new Vector3d(this.x * other.x, this.y * other.y, this.z * other.z);
    }

    scale(value: number) : Vector3d {
        return new Vector3d(this.x * value, this.y * value, this.z * value);
    }

    scaleInPlace(value: number) : void {
        this.x *= value;
        this.y *= value;
        this.z *= value;
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    dotProduct(other: Vector3d) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }
}

export { Vector3d };
