import Point2D from "./Point2D";

class Vector2D {
    /**
     *
     *  @param {Number} x
     *  @param {Number} y
     */
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    /**
     *  length
     *
     *  @returns {Number}
     */
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    /**
     *  magnitude
     *
     *  @returns {Number}
     */
    magnitude(): number {
        return this.x * this.x + this.y * this.y;
    }
    /**
     *  dot
     *
     *  @param {Vector2D} that
     *  @returns {Number}
     */
    dot(that: Vector2D): number {
        return this.x * that.x + this.y * that.y;
    }
    /**
     *  cross
     *
     *  @param {Vector2D} that
     *  @returns {Number}
     */
    cross(that: Vector2D): number {
        return this.x * that.y - this.y * that.x;
    }
    /**
     *  determinant
     *
     *  @param {Vector2D} that
     *  @returns {Number}
     */
    determinant(that: Vector2D): number {
        return this.x * that.y - this.y * that.x;
    }
    /**
     *  unit
     *
     *  @returns {Vector2D}
     */
    unit(): Vector2D {
        return this.divide(this.length());
    }
    /**
     *  add
     *
     *  @param {Vector2D} that
     *  @returns {Vector2D}
     */
    add(that: Vector2D): Vector2D {
        return new Vector2D(this.x + that.x, this.y + that.y);
    }
    /**
     *  subtract
     *
     *  @param {Vector2D} that
     *  @returns {Vector2D}
     */
    subtract(that: Vector2D): Vector2D {
        return new Vector2D(this.x - that.x, this.y - that.y);
    }
    /**
     *  multiply
     *
     *  @param {Number} scalar
     *  @returns {Vector2D}
     */
    multiply(scalar: number): Vector2D {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }
    /**
     *  divide
     *
     *  @param {Number} scalar
     *  @returns {Vector2D}
     */
    divide(scalar: number): Vector2D {
        return new Vector2D(this.x / scalar, this.y / scalar);
    }
    /**
     *  angleBetween
     *
     *  @param {Vector2D} that
     *  @returns {Number}
     */
    angleBetween(that: Vector2D): number {
        let cos = this.dot(that) / (this.length() * that.length());
        cos = Math.max(-1, Math.min(cos, 1));
        let radians = Math.acos(cos);
        return (this.cross(that) < 0.0) ? -radians : radians;
    }
    /**
     *  Find a vector is that is perpendicular to this vector
     *
     *  @returns {Vector2D}
     */
    perp(): Vector2D {
        return new Vector2D(-this.y, this.x);
    }
    /**
     *  Find the component of the specified vector that is perpendicular to
     *  this vector
     *
     *  @param {Vector2D} that
     *  @returns {Vector2D}
     */
    perpendicular(that: Vector2D): Vector2D {
        return this.subtract(this.project(that));
    }
    /**
     *  project
     *
     *  @param {Vector2D} that
     *  @returns {Vector2D}
     */
    project(that: Vector2D): Vector2D {
        let percent = this.dot(that) / that.dot(that);
        return that.multiply(percent);
    }
    /**
     *  transform
     *
     *  @param {Matrix2D}
     *  @returns {Vector2D}
     */
    transform(matrix): Vector2D {
        return new Vector2D(matrix.a * this.x + matrix.c * this.y, matrix.b * this.x + matrix.d * this.y);
    }
    /**
     *  equals
     *
     *  @param {Vector2D} that
     *  @returns {Boolean}
     */
    equals(that: Vector2D): boolean {
        return (this.x === that.x &&
            this.y === that.y);
    }
    /**
     *  precisionEquals
     *
     *  @param {Vector2D} that
     *  @param {Number} precision
     *  @returns {Boolean}
     */
    precisionEquals(that: Vector2D, precision: number): boolean {
        return (Math.abs(this.x - that.x) < precision &&
            Math.abs(this.y - that.y) < precision);
    }
    /**
     *  toString
     *
     *  @returns {String}
     */
    toString(): string {
        return "vector(" + this.x + "," + this.y + ")";
    }
    /**
     *  fromPoints
     *
     *  @param {Point2D} p1
     *  @param {Point2D} p2
     *  @returns {Vector2D}
     */
    static fromPoints(p1: Point2D, p2: Point2D): Vector2D {
        return new Vector2D(p2.x - p1.x, p2.y - p1.y);
    }
}

export default Vector2D;