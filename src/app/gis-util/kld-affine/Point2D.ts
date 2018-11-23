import Vector2D from './Vector2D'
class Point2D {

    readonly x: number;
    readonly y: number;

    /**
     *  @param {Number} x
     *  @param {Number} y
    */
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    /**
     *  clone
     *
     *  @returns {Point2D}
     */
    clone(): Point2D {
        return new Point2D(this.x, this.y);
    }
    /**
     *  add
     *
     *  @param {Point2D|Vector2D} that
     *  @returns {Point2D}
     */
    add(that: Point2D | Vector2D): Point2D {
        return new Point2D(this.x + that.x, this.y + that.y);
    }
    /**
     *  subtract
     *
     *  @param { Vector2D | Point2D } that
     *  @returns {Point2D}
     */
    subtract(that: Vector2D | Point2D): Point2D {
        return new Point2D(this.x - that.x, this.y - that.y);
    }
    /**
     *  multiply
     *
     *  @param {Number} scalar
     *  @returns {Point2D}
     */
    multiply(scalar: number): Point2D {
        return new Point2D(this.x * scalar, this.y * scalar);
    }
    /**
     *  divide
     *
     *  @param {Number} scalar
     *  @returns {Point2D}
     */
    divide(scalar: number): Point2D {
        return new Point2D(this.x / scalar, this.y / scalar);
    }
    /**
     *  equals
     *
     *  @param {Point2D} that
     *  @returns {Boolean}
     */
    equals(that: Point2D): boolean {
        return (this.x === that.x && this.y === that.y);
    }
    /**
     *  precisionEquals
     *
     *  @param {Point2D} that
     *  @param {Number} precision
     *  @returns {Boolean}
     */
    precisionEquals(that: Point2D, precision: number): boolean {
        return (Math.abs(this.x - that.x) < precision &&
            Math.abs(this.y - that.y) < precision);
    }
    // utility methods
    /**
     *  lerp
     *
     *  @param { Vector2D | Point2D } that
     *  @param {Number} t
     @  @returns {Point2D}
     */
    lerp(that: Vector2D | Point2D, t: number): Point2D {
        let omt = 1.0 - t;
        return new Point2D(this.x * omt + that.x * t, this.y * omt + that.y * t);
    }
    /**
     *  distanceFrom
     *
     *  @param {Point2D} that
     *  @returns {Number}
     */
    distanceFrom(that: Point2D): number {
        let dx = this.x - that.x;
        let dy = this.y - that.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    /**
     *  min
     *
     *  @param {Point2D} that
     *  @returns {Number}
     */
    min(that: Point2D): Point2D {
        return new Point2D(Math.min(this.x, that.x), Math.min(this.y, that.y));
    }
    /**
     *  max
     *
     *  @param {Point2D} that
     *  @returns {Number}
     */
    max(that: Point2D): Point2D {
        return new Point2D(Math.max(this.x, that.x), Math.max(this.y, that.y));
    }
    /**
     *  transform
     *
     *  @param {Matrix2D}
     *  @result {Point2D}
     */
    transform(matrix) {
        return new Point2D(matrix.a * this.x + matrix.c * this.y + matrix.e, matrix.b * this.x + matrix.d * this.y + matrix.f);
    }
    /**
     *  toString
     *
     *  @returns {String}
     */
    toString(): string {
        return "point(" + this.x + "," + this.y + ")";
    }
}

export default Point2D;