class Vector2d {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(other: Vector2d) : Vector2d {
        return new Vector2d(this.x + other.x, this.y + other.y);
    }

    minus(other: Vector2d) : Vector2d {
        return new Vector2d(this.x - other.x, this.y - other.y);
    }

    mul(other: Vector2d) : Vector2d {
        return new Vector2d(this.x * other.x, this.y * other.y);
    }

    scale(value: number) : Vector2d {
        return new Vector2d(this.x * value, this.y * value);
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}

export { Vector2d };
