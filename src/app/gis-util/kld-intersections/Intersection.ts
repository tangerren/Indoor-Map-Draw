import Point2D from '../kld-affine/Point2D';
import Vector2D from '../kld-affine/Vector2D';
import Polynomial from '../kld-polynomial/Polynomial';
import IntersectionArgs from './IntersectionArgs'
/**
 *  closePolygon
 *
 *  @param {Array<Point2D>} points
 *  @returns {Array<Point2D>}
 */
function closePolygon(points: Array<Point2D>): Array<Point2D> {
    let copy = points.slice();

    copy.push(points[0]);

    return copy;
}


/**
 *  Intersection
 */
class Intersection {
    status: any;
    points: any[];

    constructor(status) {
        this.init(status);
    }
    /**
     *  init
     *
     *  @param {String} status
     *  @returns {Intersection}
     */
    init(status: string): Intersection {
        this.status = status;
        this.points = new Array();
        return this;
    }
    /**
     *  appendPoint
     *
     *  @param {Point2D} point
     */
    appendPoint(point: Point2D) {
        this.points.push(point);
    }
    /**
     *  appendPoints
     *
     *  @param {Array<Point2D>} points
     */
    appendPoints(points: Array<Point2D>) {
        this.points = this.points.concat(points);
    }
    // static methods
    /**
     *  intersect
     *
     *  @param {IntersectionArgs} shape1
     *  @param {IntersectionArgs} shape2
     *  @returns {Intersection}
     */
    static intersect(shape1: IntersectionArgs, shape2: IntersectionArgs): Intersection {
        let result;
        if (shape1 != null && shape2 != null) {
            if (shape1.name == "Path") {
                result = Intersection.intersectPathShape(shape1, shape2);
            } else if (shape2.name == "Path") {
                result = Intersection.intersectPathShape(shape2, shape1);
            } else {
                let method;
                let args;
                if (shape1.name < shape2.name) {
                    method = "intersect" + shape1.name + shape2.name;
                    args = shape1.args.concat(shape2.args);
                } else {
                    method = "intersect" + shape2.name + shape1.name;
                    args = shape2.args.concat(shape1.args);
                }
                if (!(method in Intersection)) {
                    throw new Error("Intersection not available: " + method);
                }
                result = Intersection[method].apply(null, args);
            }
        } else {
            result = new Intersection("No Intersection");
        }
        return result;
    }
    /**
     *  intersectPathShape
     *
     *  @param {IntersectionArgs} path
     *  @param {IntersectionArgs} shape
     *  @returns {Intersection}
     */
    static intersectPathShape(path: IntersectionArgs, shape: IntersectionArgs): Intersection {
        let result = new Intersection("No Intersection");
        let length = path.args.length;
        for (let i = 0; i < length; i++) {
            let segment = path.args[i];
            let inter = Intersection.intersect(segment, shape);
            result.appendPoints(inter.points);
        }
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    }
    /**
     *  intersectBezier2Bezier2
     *
     *  @param {Point2D} a1
     *  @param {Point2D} a2
     *  @param {Point2D} a3
     *  @param {Point2D} b1
     *  @param {Point2D} b2
     *  @param {Point2D} b3
     *  @returns {Intersection}
     */
    static intersectBezier2Bezier2(a1: Point2D, a2: Point2D, a3: Point2D, b1: Point2D, b2: Point2D, b3: Point2D): Intersection {
        let aa: Point2D, bb: Point2D;
        let c12: Point2D, c11: Point2D, c10: Point2D;
        let c22: Point2D, c21: Point2D, c20: Point2D;
        let result = new Intersection("No Intersection");
        aa = a2.multiply(-2);
        c12 = a1.add(aa.add(a3));
        aa = a1.multiply(-2);
        bb = a2.multiply(2);
        c11 = aa.add(bb);
        c10 = new Point2D(a1.x, a1.y);
        aa = b2.multiply(-2);
        c22 = b1.add(aa.add(b3));
        aa = b1.multiply(-2);
        bb = b2.multiply(2);
        c21 = aa.add(bb);
        c20 = new Point2D(b1.x, b1.y);
        // bezout
        let a = c12.x * c11.y - c11.x * c12.y;
        let b = c22.x * c11.y - c11.x * c22.y;
        let c = c21.x * c11.y - c11.x * c21.y;
        let d = c11.x * (c10.y - c20.y) + c11.y * (-c10.x + c20.x);
        let e = c22.x * c12.y - c12.x * c22.y;
        let f = c21.x * c12.y - c12.x * c21.y;
        let g = c12.x * (c10.y - c20.y) + c12.y * (-c10.x + c20.x);
        // determinant
        let poly = new Polynomial(-e * e, -2 * e * f, a * b - f * f - 2 * e * g, a * c - 2 * f * g, a * d - g * g);
        let roots = poly.getRoots();
        for (let i = 0; i < roots.length; i++) {
            let s = roots[i];
            if (0 <= s && s <= 1) {
                let xp = new Polynomial(c12.x, c11.x, c10.x - c20.x - s * c21.x - s * s * c22.x);
                xp.simplify();
                let xRoots = xp.getRoots();
                let yp = new Polynomial(c12.y, c11.y, c10.y - c20.y - s * c21.y - s * s * c22.y);
                yp.simplify();
                let yRoots = yp.getRoots();
                if (xRoots.length > 0 && yRoots.length > 0) {
                    let TOLERANCE = 1e-4;
                    checkRoots: for (let j = 0; j < xRoots.length; j++) {
                        let xRoot = xRoots[j];
                        if (0 <= xRoot && xRoot <= 1) {
                            for (let k = 0; k < yRoots.length; k++) {
                                if (Math.abs(xRoot - yRoots[k]) < TOLERANCE) {
                                    result.points.push(c22.multiply(s * s).add(c21.multiply(s).add(c20)));
                                    break checkRoots;
                                }
                            }
                        }
                    }
                }
            }
        }
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    }
    /**
     *  intersectBezier2Bezier3
     *
     *  @param {Point2D} a1
     *  @param {Point2D} a2
     *  @param {Point2D} a3
     *  @param {Point2D} b1
     *  @param {Point2D} b2
     *  @param {Point2D} b3
     *  @param {Point2D} b4
     *  @returns {Intersection}
     */
    static intersectBezier2Bezier3(a1: Point2D, a2: Point2D, a3: Point2D, b1: Point2D, b2: Point2D, b3: Point2D, b4: Point2D): Intersection {
        let a, b, c, d;
        let c12, c11, c10;
        let c23, c22, c21, c20;
        let result = new Intersection("No Intersection");
        a = a2.multiply(-2);
        c12 = a1.add(a.add(a3));
        a = a1.multiply(-2);
        b = a2.multiply(2);
        c11 = a.add(b);
        c10 = new Point2D(a1.x, a1.y);
        a = b1.multiply(-1);
        b = b2.multiply(3);
        c = b3.multiply(-3);
        d = a.add(b.add(c.add(b4)));
        c23 = new Vector2D(d.x, d.y);
        a = b1.multiply(3);
        b = b2.multiply(-6);
        c = b3.multiply(3);
        d = a.add(b.add(c));
        c22 = new Vector2D(d.x, d.y);
        a = b1.multiply(-3);
        b = b2.multiply(3);
        c = a.add(b);
        c21 = new Vector2D(c.x, c.y);
        c20 = new Vector2D(b1.x, b1.y);
        let c10x2 = c10.x * c10.x;
        let c10y2 = c10.y * c10.y;
        let c11x2 = c11.x * c11.x;
        let c11y2 = c11.y * c11.y;
        let c12x2 = c12.x * c12.x;
        let c12y2 = c12.y * c12.y;
        let c20x2 = c20.x * c20.x;
        let c20y2 = c20.y * c20.y;
        let c21x2 = c21.x * c21.x;
        let c21y2 = c21.y * c21.y;
        let c22x2 = c22.x * c22.x;
        let c22y2 = c22.y * c22.y;
        let c23x2 = c23.x * c23.x;
        let c23y2 = c23.y * c23.y;
        let poly = new Polynomial(-2 * c12.x * c12.y * c23.x * c23.y + c12x2 * c23y2 + c12y2 * c23x2, -2 * c12.x * c12.y * c22.x * c23.y - 2 * c12.x * c12.y * c22.y * c23.x + 2 * c12y2 * c22.x * c23.x +
            2 * c12x2 * c22.y * c23.y, -2 * c12.x * c21.x * c12.y * c23.y - 2 * c12.x * c12.y * c21.y * c23.x - 2 * c12.x * c12.y * c22.x * c22.y +
            2 * c21.x * c12y2 * c23.x + c12y2 * c22x2 + c12x2 * (2 * c21.y * c23.y + c22y2), 2 * c10.x * c12.x * c12.y * c23.y + 2 * c10.y * c12.x * c12.y * c23.x + c11.x * c11.y * c12.x * c23.y +
            c11.x * c11.y * c12.y * c23.x - 2 * c20.x * c12.x * c12.y * c23.y - 2 * c12.x * c20.y * c12.y * c23.x -
            2 * c12.x * c21.x * c12.y * c22.y - 2 * c12.x * c12.y * c21.y * c22.x - 2 * c10.x * c12y2 * c23.x -
            2 * c10.y * c12x2 * c23.y + 2 * c20.x * c12y2 * c23.x + 2 * c21.x * c12y2 * c22.x -
            c11y2 * c12.x * c23.x - c11x2 * c12.y * c23.y + c12x2 * (2 * c20.y * c23.y + 2 * c21.y * c22.y), 2 * c10.x * c12.x * c12.y * c22.y + 2 * c10.y * c12.x * c12.y * c22.x + c11.x * c11.y * c12.x * c22.y +
            c11.x * c11.y * c12.y * c22.x - 2 * c20.x * c12.x * c12.y * c22.y - 2 * c12.x * c20.y * c12.y * c22.x -
            2 * c12.x * c21.x * c12.y * c21.y - 2 * c10.x * c12y2 * c22.x - 2 * c10.y * c12x2 * c22.y +
            2 * c20.x * c12y2 * c22.x - c11y2 * c12.x * c22.x - c11x2 * c12.y * c22.y + c21x2 * c12y2 +
            c12x2 * (2 * c20.y * c22.y + c21y2), 2 * c10.x * c12.x * c12.y * c21.y + 2 * c10.y * c12.x * c21.x * c12.y + c11.x * c11.y * c12.x * c21.y +
            c11.x * c11.y * c21.x * c12.y - 2 * c20.x * c12.x * c12.y * c21.y - 2 * c12.x * c20.y * c21.x * c12.y -
            2 * c10.x * c21.x * c12y2 - 2 * c10.y * c12x2 * c21.y + 2 * c20.x * c21.x * c12y2 -
            c11y2 * c12.x * c21.x - c11x2 * c12.y * c21.y + 2 * c12x2 * c20.y * c21.y, -2 * c10.x * c10.y * c12.x * c12.y - c10.x * c11.x * c11.y * c12.y - c10.y * c11.x * c11.y * c12.x +
            2 * c10.x * c12.x * c20.y * c12.y + 2 * c10.y * c20.x * c12.x * c12.y + c11.x * c20.x * c11.y * c12.y +
            c11.x * c11.y * c12.x * c20.y - 2 * c20.x * c12.x * c20.y * c12.y - 2 * c10.x * c20.x * c12y2 +
            c10.x * c11y2 * c12.x + c10.y * c11x2 * c12.y - 2 * c10.y * c12x2 * c20.y -
            c20.x * c11y2 * c12.x - c11x2 * c20.y * c12.y + c10x2 * c12y2 + c10y2 * c12x2 +
            c20x2 * c12y2 + c12x2 * c20y2);
        let roots = poly.getRootsInInterval(0, 1);
        for (let i = 0; i < roots.length; i++) {
            let s = roots[i];
            let xRoots = new Polynomial(c12.x, c11.x, c10.x - c20.x - s * c21.x - s * s * c22.x - s * s * s * c23.x).getRoots();
            let yRoots = new Polynomial(c12.y, c11.y, c10.y - c20.y - s * c21.y - s * s * c22.y - s * s * s * c23.y).getRoots();
            if (xRoots.length > 0 && yRoots.length > 0) {
                let TOLERANCE = 1e-4;
                checkRoots: for (let j = 0; j < xRoots.length; j++) {
                    let xRoot = xRoots[j];
                    if (0 <= xRoot && xRoot <= 1) {
                        for (let k = 0; k < yRoots.length; k++) {
                            if (Math.abs(xRoot - yRoots[k]) < TOLERANCE) {
                                result.points.push(c23.multiply(s * s * s).add(c22.multiply(s * s).add(c21.multiply(s).add(c20))));
                                break checkRoots;
                            }
                        }
                    }
                }
            }
        }
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    }
    /**
     *  intersectBezier2Circle
     *
     *  @param {Point2D} p1
     *  @param {Point2D} p2
     *  @param {Point2D} p3
     *  @param {Point2D} c
     *  @param {Number} r
     *  @returns {Intersection}
     */
    static intersectBezier2Circle(p1: Point2D, p2: Point2D, p3: Point2D, c: Point2D, r: number): Intersection {
        return Intersection.intersectBezier2Ellipse(p1, p2, p3, c, r, r);
    }
    /**
     *  intersectBezier2Ellipse
     *
     *  @param {Point2D} p1
     *  @param {Point2D} p2
     *  @param {Point2D} p3
     *  @param {Point2D} ec
     *  @param {Number} rx
     *  @param {Number} ry
     *  @returns {Intersection}
     */
    static intersectBezier2Ellipse(p1: Point2D, p2: Point2D, p3: Point2D, ec: Point2D, rx: number, ry: number): Intersection {
        let a, b; // temporary letiables
        let c2, c1, c0; // coefficients of quadratic
        let result = new Intersection("No Intersection");
        a = p2.multiply(-2);
        c2 = p1.add(a.add(p3));
        a = p1.multiply(-2);
        b = p2.multiply(2);
        c1 = a.add(b);
        c0 = new Point2D(p1.x, p1.y);
        let rxrx = rx * rx;
        let ryry = ry * ry;
        let roots = new Polynomial(ryry * c2.x * c2.x + rxrx * c2.y * c2.y, 2 * (ryry * c2.x * c1.x + rxrx * c2.y * c1.y), ryry * (2 * c2.x * c0.x + c1.x * c1.x) + rxrx * (2 * c2.y * c0.y + c1.y * c1.y) -
            2 * (ryry * ec.x * c2.x + rxrx * ec.y * c2.y), 2 * (ryry * c1.x * (c0.x - ec.x) + rxrx * c1.y * (c0.y - ec.y)), ryry * (c0.x * c0.x + ec.x * ec.x) + rxrx * (c0.y * c0.y + ec.y * ec.y) -
            2 * (ryry * ec.x * c0.x + rxrx * ec.y * c0.y) - rxrx * ryry).getRoots();
        for (let i = 0; i < roots.length; i++) {
            let t = roots[i];
            if (0 <= t && t <= 1) {
                result.points.push(c2.multiply(t * t).add(c1.multiply(t).add(c0)));
            }
        }
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    }
    /**
     *  intersectBezier2Line
     *
     *  @param {Point2D} p1
     *  @param {Point2D} p2
     *  @param {Point2D} p3
     *  @param {Point2D} a1
     *  @param {Point2D} a2
     *  @returns {Intersection}
     */
    static intersectBezier2Line(p1: Point2D, p2: Point2D, p3: Point2D, a1: Point2D, a2: Point2D): Intersection {
        let a, b; // temporary letiables
        let c2, c1, c0; // coefficients of quadratic
        let cl; // c coefficient for normal form of line
        let n; // normal for normal form of line
        let min = a1.min(a2); // used to determine if point is on line segment
        let max = a1.max(a2); // used to determine if point is on line segment
        let result = new Intersection("No Intersection");
        a = p2.multiply(-2);
        c2 = p1.add(a.add(p3));
        a = p1.multiply(-2);
        b = p2.multiply(2);
        c1 = a.add(b);
        c0 = new Point2D(p1.x, p1.y);
        // Convert line to normal form: ax + by + c = 0
        // Find normal to line: negative inverse of original line's slope
        n = new Vector2D(a1.y - a2.y, a2.x - a1.x);
        // Determine new c coefficient
        cl = a1.x * a2.y - a2.x * a1.y;
        // Transform cubic coefficients to line's coordinate system and find roots
        // of cubic
        let roots = new Polynomial(n.dot(c2), n.dot(c1), n.dot(c0) + cl).getRoots();
        // Any roots in closed interval [0,1] are intersections on Bezier, but
        // might not be on the line segment.
        // Find intersections and calculate point coordinates
        for (let i = 0; i < roots.length; i++) {
            let t = roots[i];
            if (0 <= t && t <= 1) {
                // We're within the Bezier curve
                // Find point on Bezier
                let p4 = p1.lerp(p2, t);
                let p5 = p2.lerp(p3, t);
                let p6 = p4.lerp(p5, t);
                // See if point is on line segment
                // Had to make special cases for vertical and horizontal lines due
                // to slight errors in calculation of p6
                if (a1.x == a2.x) {
                    if (min.y <= p6.y && p6.y <= max.y) {
                        result.status = "Intersection";
                        result.appendPoint(p6);
                    }
                } else if (a1.y == a2.y) {
                    if (min.x <= p6.x && p6.x <= max.x) {
                        result.status = "Intersection";
                        result.appendPoint(p6);
                    }
                } else if (min.x <= p6.x && p6.x <= max.x && min.y <= p6.y && p6.y <= max.y) {
                    result.status = "Intersection";
                    result.appendPoint(p6);
                }
            }
        }
        return result;
    }
    /**
     *  intersectBezier2Polygon
     *
     *  @param {Point2D} p1
     *  @param {Point2D} p2
     *  @param {Point2D} p3
     *  @param {Array<Point2D>} points
     *  @returns {Intersection}
     */
    static intersectBezier2Polygon(p1: Point2D, p2: Point2D, p3: Point2D, points: Array<Point2D>): Intersection {
        return Intersection.intersectBezier2Polyline(p1, p2, p3, closePolygon(points));
    }
    /**
     *  intersectBezier2Polyline
     *
     *  @param {Point2D} p1
     *  @param {Point2D} p2
     *  @param {Point2D} p3
     *  @param {Array<Point2D>} points
     *  @returns {Intersection}
     */
    static intersectBezier2Polyline(p1: Point2D, p2: Point2D, p3: Point2D, points: Array<Point2D>): Intersection {
        let result = new Intersection("No Intersection");
        let length = points.length;
        for (let i = 0; i < length - 1; i++) {
            let a1 = points[i];
            let a2 = points[i + 1];
            let inter = Intersection.intersectBezier2Line(p1, p2, p3, a1, a2);
            result.appendPoints(inter.points);
        }
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    }
    /**
     *  intersectBezier2Rectangle
     *
     *  @param {Point2D} p1
     *  @param {Point2D} p2
     *  @param {Point2D} p3
     *  @param {Point2D} r1
     *  @param {Point2D} r2
     *  @returns {Intersection}
     */
    static intersectBezier2Rectangle(p1: Point2D, p2: Point2D, p3: Point2D, r1: Point2D, r2: Point2D): Intersection {
        let min = r1.min(r2);
        let max = r1.max(r2);
        let topRight = new Point2D(max.x, min.y);
        let bottomLeft = new Point2D(min.x, max.y);
        let inter1 = Intersection.intersectBezier2Line(p1, p2, p3, min, topRight);
        let inter2 = Intersection.intersectBezier2Line(p1, p2, p3, topRight, max);
        let inter3 = Intersection.intersectBezier2Line(p1, p2, p3, max, bottomLeft);
        let inter4 = Intersection.intersectBezier2Line(p1, p2, p3, bottomLeft, min);
        let result = new Intersection("No Intersection");
        result.appendPoints(inter1.points);
        result.appendPoints(inter2.points);
        result.appendPoints(inter3.points);
        result.appendPoints(inter4.points);
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    }
    /**
     *  intersectBezier3Bezier3
     *
     *  @param {Point2D} a1
     *  @param {Point2D} a2
     *  @param {Point2D} a3
     *  @param {Point2D} a4
     *  @param {Point2D} b1
     *  @param {Point2D} b2
     *  @param {Point2D} b3
     *  @param {Point2D} b4
     *  @returns {Intersection}
     */
    static intersectBezier3Bezier3(a1: Point2D, a2: Point2D, a3: Point2D, a4: Point2D, b1: Point2D, b2: Point2D, b3: Point2D, b4: Point2D): Intersection {
        let aa: Point2D, bb: Point2D, cc: Point2D, dd: Point2D; // temporary letiables
        let c13: Vector2D, c12: Vector2D, c11: Vector2D, c10: Vector2D; // coefficients of cubic
        let c23: Vector2D, c22: Vector2D, c21: Vector2D, c20: Vector2D; // coefficients of cubic
        let result = new Intersection("No Intersection");
        // Calculate the coefficients of cubic polynomial
        aa = a1.multiply(-1);
        bb = a2.multiply(3);
        cc = a3.multiply(-3);
        dd = aa.add(bb.add(cc.add(a4)));
        c13 = new Vector2D(dd.x, dd.y);
        aa = a1.multiply(3);
        bb = a2.multiply(-6);
        cc = a3.multiply(3);
        dd = aa.add(bb.add(cc));
        c12 = new Vector2D(dd.x, dd.y);
        aa = a1.multiply(-3);
        bb = a2.multiply(3);
        cc = aa.add(bb);
        c11 = new Vector2D(cc.x, cc.y);
        c10 = new Vector2D(a1.x, a1.y);
        aa = b1.multiply(-1);
        bb = b2.multiply(3);
        cc = b3.multiply(-3);
        dd = aa.add(bb.add(cc.add(b4)));
        c23 = new Vector2D(dd.x, dd.y);
        aa = b1.multiply(3);
        bb = b2.multiply(-6);
        cc = b3.multiply(3);
        dd = aa.add(bb.add(cc));
        c22 = new Vector2D(dd.x, dd.y);
        aa = b1.multiply(-3);
        bb = b2.multiply(3);
        cc = aa.add(bb);
        c21 = new Vector2D(cc.x, cc.y);
        c20 = new Vector2D(b1.x, b1.y);
        // bezout
        let a = c13.x * c12.y - c12.x * c13.y;
        let b = c13.x * c11.y - c11.x * c13.y;
        let c0 = c13.x * c10.y - c10.x * c13.y + c20.x * c13.y - c13.x * c20.y;
        let c1 = c21.x * c13.y - c13.x * c21.y;
        let c2 = c22.x * c13.y - c13.x * c22.y;
        let c3 = c23.x * c13.y - c13.x * c23.y;
        let d = c13.x * c11.y - c11.x * c13.y;
        let e0 = c13.x * c10.y + c12.x * c11.y - c11.x * c12.y - c10.x * c13.y + c20.x * c13.y - c13.x * c20.y;
        let e1 = c21.x * c13.y - c13.x * c21.y;
        let e2 = c22.x * c13.y - c13.x * c22.y;
        let e3 = c23.x * c13.y - c13.x * c23.y;
        let f0 = c12.x * c10.y - c10.x * c12.y + c20.x * c12.y - c12.x * c20.y;
        let f1 = c21.x * c12.y - c12.x * c21.y;
        let f2 = c22.x * c12.y - c12.x * c22.y;
        let f3 = c23.x * c12.y - c12.x * c23.y;
        let g0 = c13.x * c10.y - c10.x * c13.y + c20.x * c13.y - c13.x * c20.y;
        let g1 = c21.x * c13.y - c13.x * c21.y;
        let g2 = c22.x * c13.y - c13.x * c22.y;
        let g3 = c23.x * c13.y - c13.x * c23.y;
        let h0 = c12.x * c10.y - c10.x * c12.y + c20.x * c12.y - c12.x * c20.y;
        let h1 = c21.x * c12.y - c12.x * c21.y;
        let h2 = c22.x * c12.y - c12.x * c22.y;
        let h3 = c23.x * c12.y - c12.x * c23.y;
        let i0 = c11.x * c10.y - c10.x * c11.y + c20.x * c11.y - c11.x * c20.y;
        let i1 = c21.x * c11.y - c11.x * c21.y;
        let i2 = c22.x * c11.y - c11.x * c22.y;
        let i3 = c23.x * c11.y - c11.x * c23.y;
        // determinant
        let poly = new Polynomial(-c3 * e3 * g3, -c3 * e3 * g2 - c3 * e2 * g3 - c2 * e3 * g3, -c3 * e3 * g1 - c3 * e2 * g2 - c2 * e3 * g2 - c3 * e1 * g3 - c2 * e2 * g3 - c1 * e3 * g3, -c3 * e3 * g0 - c3 * e2 * g1 - c2 * e3 * g1 - c3 * e1 * g2 - c2 * e2 * g2 - c1 * e3 * g2 - c3 * e0 * g3 - c2 * e1 * g3 - c1 * e2 * g3 - c0 * e3 * g3 + b * f3 * g3 + c3 * d * h3 - a * f3 * h3 + a * e3 * i3, -c3 * e2 * g0 - c2 * e3 * g0 - c3 * e1 * g1 - c2 * e2 * g1 - c1 * e3 * g1 - c3 * e0 * g2 - c2 * e1 * g2 - c1 * e2 * g2 - c0 * e3 * g2 + b * f3 * g2 - c2 * e0 * g3 - c1 * e1 * g3 - c0 * e2 * g3 + b * f2 * g3 + c3 * d * h2 - a * f3 * h2 + c2 * d * h3 - a * f2 * h3 + a * e3 * i2 + a * e2 * i3, -c3 * e1 * g0 - c2 * e2 * g0 - c1 * e3 * g0 - c3 * e0 * g1 - c2 * e1 * g1 - c1 * e2 * g1 - c0 * e3 * g1 + b * f3 * g1 - c2 * e0 * g2 - c1 * e1 * g2 - c0 * e2 * g2 + b * f2 * g2 - c1 * e0 * g3 - c0 * e1 * g3 + b * f1 * g3 + c3 * d * h1 - a * f3 * h1 + c2 * d * h2 - a * f2 * h2 + c1 * d * h3 - a * f1 * h3 + a * e3 * i1 + a * e2 * i2 + a * e1 * i3, -c3 * e0 * g0 - c2 * e1 * g0 - c1 * e2 * g0 - c0 * e3 * g0 + b * f3 * g0 - c2 * e0 * g1 - c1 * e1 * g1 - c0 * e2 * g1 + b * f2 * g1 - c1 * e0 * g2 - c0 * e1 * g2 + b * f1 * g2 - c0 * e0 * g3 + b * f0 * g3 + c3 * d * h0 - a * f3 * h0 + c2 * d * h1 - a * f2 * h1 + c1 * d * h2 - a * f1 * h2 + c0 * d * h3 - a * f0 * h3 + a * e3 * i0 + a * e2 * i1 + a * e1 * i2 - b * d * i3 + a * e0 * i3, -c2 * e0 * g0 - c1 * e1 * g0 - c0 * e2 * g0 + b * f2 * g0 - c1 * e0 * g1 - c0 * e1 * g1 + b * f1 * g1 - c0 * e0 * g2 + b * f0 * g2 + c2 * d * h0 - a * f2 * h0 + c1 * d * h1 - a * f1 * h1 + c0 * d * h2 - a * f0 * h2 + a * e2 * i0 + a * e1 * i1 - b * d * i2 + a * e0 * i2, -c1 * e0 * g0 - c0 * e1 * g0 + b * f1 * g0 - c0 * e0 * g1 + b * f0 * g1 + c1 * d * h0 - a * f1 * h0 + c0 * d * h1 - a * f0 * h1 + a * e1 * i0 - b * d * i1 + a * e0 * i1, -c0 * e0 * g0 + b * f0 * g0 + c0 * d * h0 - a * f0 * h0 - b * d * i0 + a * e0 * i0);
        poly.simplify();
        let roots = poly.getRootsInInterval(0, 1);
        for (let i = 0; i < roots.length; i++) {
            let s = roots[i];
            let xp = new Polynomial(c13.x, c12.x, c11.x, c10.x - c20.x - s * c21.x - s * s * c22.x - s * s * s * c23.x);
            xp.simplify();
            let xRoots = xp.getRoots();
            let yp = new Polynomial(c13.y, c12.y, c11.y, c10.y - c20.y - s * c21.y - s * s * c22.y - s * s * s * c23.y);
            yp.simplify();
            let yRoots = yp.getRoots();
            if (xRoots.length > 0 && yRoots.length > 0) {
                let TOLERANCE = 1e-4;
                checkRoots: for (let j = 0; j < xRoots.length; j++) {
                    let xRoot = xRoots[j];
                    if (0 <= xRoot && xRoot <= 1) {
                        for (let k = 0; k < yRoots.length; k++) {
                            if (Math.abs(xRoot - yRoots[k]) < TOLERANCE) {
                                result.points.push(c23.multiply(s * s * s).add(c22.multiply(s * s).add(c21.multiply(s).add(c20))));
                                break checkRoots;
                            }
                        }
                    }
                }
            }
        }
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    }
    /**
     *  intersectBezier3Circle
     *
     *  @param {Point2D} p1
     *  @param {Point2D} p2
     *  @param {Point2D} p3
     *  @param {Point2D} p4
     *  @param {Point2D} c
     *  @param {Number} r
     *  @returns {Intersection}
     */
    static intersectBezier3Circle(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D, c: Point2D, r: number): Intersection {
        return Intersection.intersectBezier3Ellipse(p1, p2, p3, p4, c, r, r);
    }
    /**
     *  intersectBezier3Ellipse
     *
     *  @param {Point2D} p1
     *  @param {Point2D} p2
     *  @param {Point2D} p3
     *  @param {Point2D} p4
     *  @param {Point2D} ec
     *  @param {Number} rx
     *  @param {Number} ry
     *  @returns {Intersection}
     */
    static intersectBezier3Ellipse(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D, ec: Point2D, rx: number, ry: number): Intersection {
        let a, b, c, d; // temporary letiables
        let c3, c2, c1, c0; // coefficients of cubic
        let result = new Intersection("No Intersection");
        // Calculate the coefficients of cubic polynomial
        a = p1.multiply(-1);
        b = p2.multiply(3);
        c = p3.multiply(-3);
        d = a.add(b.add(c.add(p4)));
        c3 = new Vector2D(d.x, d.y);
        a = p1.multiply(3);
        b = p2.multiply(-6);
        c = p3.multiply(3);
        d = a.add(b.add(c));
        c2 = new Vector2D(d.x, d.y);
        a = p1.multiply(-3);
        b = p2.multiply(3);
        c = a.add(b);
        c1 = new Vector2D(c.x, c.y);
        c0 = new Vector2D(p1.x, p1.y);
        let rxrx = rx * rx;
        let ryry = ry * ry;
        let poly = new Polynomial(c3.x * c3.x * ryry + c3.y * c3.y * rxrx, 2 * (c3.x * c2.x * ryry + c3.y * c2.y * rxrx), 2 * (c3.x * c1.x * ryry + c3.y * c1.y * rxrx) + c2.x * c2.x * ryry + c2.y * c2.y * rxrx, 2 * c3.x * ryry * (c0.x - ec.x) + 2 * c3.y * rxrx * (c0.y - ec.y) +
            2 * (c2.x * c1.x * ryry + c2.y * c1.y * rxrx), 2 * c2.x * ryry * (c0.x - ec.x) + 2 * c2.y * rxrx * (c0.y - ec.y) +
            c1.x * c1.x * ryry + c1.y * c1.y * rxrx, 2 * c1.x * ryry * (c0.x - ec.x) + 2 * c1.y * rxrx * (c0.y - ec.y), c0.x * c0.x * ryry - 2 * c0.y * ec.y * rxrx - 2 * c0.x * ec.x * ryry +
            c0.y * c0.y * rxrx + ec.x * ec.x * ryry + ec.y * ec.y * rxrx - rxrx * ryry);
        let roots = poly.getRootsInInterval(0, 1);
        for (let i = 0; i < roots.length; i++) {
            let t = roots[i];
            result.points.push(c3.multiply(t * t * t).add(c2.multiply(t * t).add(c1.multiply(t).add(c0))));
        }
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    }
    /**
     *  intersectBezier3Line
     *
     *  Many thanks to Dan Sunday at SoftSurfer.com.  He gave me a very thorough
     *  sketch of the algorithm used here.  Without his help, I'm not sure when I
     *  would have figured out this intersection problem.
     *
     *  @param {Point2D} p1
     *  @param {Point2D} p2
     *  @param {Point2D} p3
     *  @param {Point2D} p4
     *  @param {Point2D} a1
     *  @param {Point2D} a2
     *  @returns {Intersection}
     */
    static intersectBezier3Line(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D, a1: Point2D, a2: Point2D): Intersection {
        let a, b, c, d; // temporary letiables
        let c3, c2, c1, c0; // coefficients of cubic
        let cl; // c coefficient for normal form of line
        let n; // normal for normal form of line
        let min = a1.min(a2); // used to determine if point is on line segment
        let max = a1.max(a2); // used to determine if point is on line segment
        let result = new Intersection("No Intersection");
        // Start with Bezier using Bernstein polynomials for weighting functions:
        //     (1-t^3)P1 + 3t(1-t)^2P2 + 3t^2(1-t)P3 + t^3P4
        //
        // Expand and collect terms to form linear combinations of original Bezier
        // controls.  This ends up with a vector cubic in t:
        //     (-P1+3P2-3P3+P4)t^3 + (3P1-6P2+3P3)t^2 + (-3P1+3P2)t + P1
        //             /\                  /\                /\       /\
        //             ||                  ||                ||       ||
        //             c3                  c2                c1       c0
        // Calculate the coefficients
        a = p1.multiply(-1);
        b = p2.multiply(3);
        c = p3.multiply(-3);
        d = a.add(b.add(c.add(p4)));
        c3 = new Vector2D(d.x, d.y);
        a = p1.multiply(3);
        b = p2.multiply(-6);
        c = p3.multiply(3);
        d = a.add(b.add(c));
        c2 = new Vector2D(d.x, d.y);
        a = p1.multiply(-3);
        b = p2.multiply(3);
        c = a.add(b);
        c1 = new Vector2D(c.x, c.y);
        c0 = new Vector2D(p1.x, p1.y);
        // Convert line to normal form: ax + by + c = 0
        // Find normal to line: negative inverse of original line's slope
        n = new Vector2D(a1.y - a2.y, a2.x - a1.x);
        // Determine new c coefficient
        cl = a1.x * a2.y - a2.x * a1.y;
        // ?Rotate each cubic coefficient using line for new coordinate system?
        // Find roots of rotated cubic
        let roots = new Polynomial(n.dot(c3), n.dot(c2), n.dot(c1), n.dot(c0) + cl).getRoots();
        // Any roots in closed interval [0,1] are intersections on Bezier, but
        // might not be on the line segment.
        // Find intersections and calculate point coordinates
        for (let i = 0; i < roots.length; i++) {
            let t = roots[i];
            if (0 <= t && t <= 1) {
                // We're within the Bezier curve
                // Find point on Bezier
                let p5 = p1.lerp(p2, t);
                let p6 = p2.lerp(p3, t);
                let p7 = p3.lerp(p4, t);
                let p8 = p5.lerp(p6, t);
                let p9 = p6.lerp(p7, t);
                let p10 = p8.lerp(p9, t);
                // See if point is on line segment
                // Had to make special cases for vertical and horizontal lines due
                // to slight errors in calculation of p10
                if (a1.x == a2.x) {
                    if (min.y <= p10.y && p10.y <= max.y) {
                        result.status = "Intersection";
                        result.appendPoint(p10);
                    }
                } else if (a1.y == a2.y) {
                    if (min.x <= p10.x && p10.x <= max.x) {
                        result.status = "Intersection";
                        result.appendPoint(p10);
                    }
                } else if (min.x <= p10.x && p10.x <= max.x && min.y <= p10.y && p10.y <= max.y) {
                    result.status = "Intersection";
                    result.appendPoint(p10);
                }
            }
        }
        return result;
    }
    /**
     *  intersectBezier3Polygon
     *
     *  @param {Point2D} p1
     *  @param {Point2D} p2
     *  @param {Point2D} p3
     *  @param {Point2D} p4
     *  @param {Array<Point2D>} points
     *  @returns {Intersection}
     */
    static intersectBezier3Polygon(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D, points: Array<Point2D>): Intersection {
        return this.intersectBezier3Polyline(p1, p2, p3, p4, closePolygon(points));
    }
    /**
     *  intersectBezier3Polyline
     *
     *  @param {Point2D} p1
     *  @param {Point2D} p2
     *  @param {Point2D} p3
     *  @param {Point2D} p4
     *  @param {Array<Point2D>} points
     *  @returns {Intersection}
     */
    static intersectBezier3Polyline(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D, points: Array<Point2D>): Intersection {
        let result = new Intersection("No Intersection");
        let length = points.length;
        for (let i = 0; i < length - 1; i++) {
            let a1 = points[i];
            let a2 = points[i + 1];
            let inter = Intersection.intersectBezier3Line(p1, p2, p3, p4, a1, a2);
            result.appendPoints(inter.points);
        }
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    }
    /**
     *  intersectBezier3Rectangle
     *
     *  @param {Point2D} p1
     *  @param {Point2D} p2
     *  @param {Point2D} p3
     *  @param {Point2D} p4
     *  @param {Point2D} r1
     *  @param {Point2D} r2
     *  @returns {Intersection}
     */
    static intersectBezier3Rectangle(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D, r1: Point2D, r2: Point2D): Intersection {
        let min = r1.min(r2);
        let max = r1.max(r2);
        let topRight = new Point2D(max.x, min.y);
        let bottomLeft = new Point2D(min.x, max.y);
        let inter1 = Intersection.intersectBezier3Line(p1, p2, p3, p4, min, topRight);
        let inter2 = Intersection.intersectBezier3Line(p1, p2, p3, p4, topRight, max);
        let inter3 = Intersection.intersectBezier3Line(p1, p2, p3, p4, max, bottomLeft);
        let inter4 = Intersection.intersectBezier3Line(p1, p2, p3, p4, bottomLeft, min);
        let result = new Intersection("No Intersection");
        result.appendPoints(inter1.points);
        result.appendPoints(inter2.points);
        result.appendPoints(inter3.points);
        result.appendPoints(inter4.points);
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    }
    /**
     *  intersectCircleCircle
     *
     *  @param {Point2D} c1
     *  @param {Number} r1
     *  @param {Point2D} c2
     *  @param {Number} r2
     *  @returns {Intersection}
     */
    static intersectCircleCircle(c1: Point2D, r1: number, c2: Point2D, r2: number): Intersection {
        let result;
        // Determine minimum and maximum radii where circles can intersect
        let r_max = r1 + r2;
        let r_min = Math.abs(r1 - r2);
        // Determine actual distance between circle circles
        let c_dist = c1.distanceFrom(c2);
        if (c_dist > r_max) {
            result = new Intersection("Outside");
        } else if (c_dist < r_min) {
            result = new Intersection("Inside");
        } else {
            result = new Intersection("Intersection");
            let a = (r1 * r1 - r2 * r2 + c_dist * c_dist) / (2 * c_dist);
            let h = Math.sqrt(r1 * r1 - a * a);
            let p = c1.lerp(c2, a / c_dist);
            let b = h / c_dist;
            result.points.push(new Point2D(p.x - b * (c2.y - c1.y), p.y + b * (c2.x - c1.x)));
            result.points.push(new Point2D(p.x + b * (c2.y - c1.y), p.y - b * (c2.x - c1.x)));
        }
        return result;
    }
    /**
     *  intersectCircleEllipse
     *
     *  @param {Point2D} cc
     *  @param {Number} r
     *  @param {Point2D} ec
     *  @param {Number} rx
     *  @param {Number} ry
     *  @returns {Intersection}
     */
    static intersectCircleEllipse(cc: Point2D, r: number, ec: Point2D, rx: number, ry: number): Intersection {
        return Intersection.intersectEllipseEllipse(cc, r, r, ec, rx, ry);
    }
    /**
     *  intersectCircleLine
     *
     *  @param {Point2D} c
     *  @param {Number} r
     *  @param {Point2D} a1
     *  @param {Point2D} a2
     *  @returns {Intersection}
     */
    static intersectCircleLine(c: Point2D, r: number, a1: Point2D, a2: Point2D): Intersection {
        let result;
        let a = (a2.x - a1.x) * (a2.x - a1.x) +
            (a2.y - a1.y) * (a2.y - a1.y);
        let b = 2 * ((a2.x - a1.x) * (a1.x - c.x) +
            (a2.y - a1.y) * (a1.y - c.y));
        let cc = c.x * c.x + c.y * c.y + a1.x * a1.x + a1.y * a1.y -
            2 * (c.x * a1.x + c.y * a1.y) - r * r;
        let deter = b * b - 4 * a * cc;
        if (deter < 0) {
            result = new Intersection("Outside");
        } else if (deter == 0) {
            result = new Intersection("Tangent");
            // NOTE: should calculate this point
        } else {
            let e = Math.sqrt(deter);
            let u1 = (-b + e) / (2 * a);
            let u2 = (-b - e) / (2 * a);
            if ((u1 < 0 || u1 > 1) && (u2 < 0 || u2 > 1)) {
                if ((u1 < 0 && u2 < 0) || (u1 > 1 && u2 > 1)) {
                    result = new Intersection("Outside");
                } else {
                    result = new Intersection("Inside");
                }
            } else {
                result = new Intersection("Intersection");
                if (0 <= u1 && u1 <= 1) {
                    result.points.push(a1.lerp(a2, u1));
                }
                if (0 <= u2 && u2 <= 1) {
                    result.points.push(a1.lerp(a2, u2));
                }
            }
        }
        return result;
    }
    /**
     *  intersectCirclePolygon
     *
     *  @param {Point2D} c
     *  @param {Number} r
     *  @param {Array<Point2D>} points
     *  @returns {Intersection}
     */
    static intersectCirclePolygon(c: Point2D, r: number, points: Array<Point2D>): Intersection {
        return this.intersectCirclePolyline(c, r, closePolygon(points));
    }
    /**
     *  intersectCirclePolyline
     *
     *  @param {Point2D} c
     *  @param {Number} r
     *  @param {Array<Point2D>} points
     *  @returns {Intersection}
     */
    static intersectCirclePolyline(c: Point2D, r: number, points: Array<Point2D>): Intersection {
        let result = new Intersection("No Intersection");
        let length = points.length;
        let inter;
        for (let i = 0; i < length - 1; i++) {
            let a1 = points[i];
            let a2 = points[i + 1];
            inter = Intersection.intersectCircleLine(c, r, a1, a2);
            result.appendPoints(inter.points);
        }
        if (result.points.length > 0) {
            result.status = "Intersection";
        } else {
            result.status = inter.status;
        }
        return result;
    }
    /**
     *  intersectCircleRectangle
     *
     *  @param {Point2D} c
     *  @param {Number} r
     *  @param {Point2D} r1
     *  @param {Point2D} r2
     *  @returns {Intersection}
     */
    static intersectCircleRectangle(c: Point2D, r: number, r1: Point2D, r2: Point2D): Intersection {
        let min = r1.min(r2);
        let max = r1.max(r2);
        let topRight = new Point2D(max.x, min.y);
        let bottomLeft = new Point2D(min.x, max.y);
        let inter1 = Intersection.intersectCircleLine(c, r, min, topRight);
        let inter2 = Intersection.intersectCircleLine(c, r, topRight, max);
        let inter3 = Intersection.intersectCircleLine(c, r, max, bottomLeft);
        let inter4 = Intersection.intersectCircleLine(c, r, bottomLeft, min);
        let result = new Intersection("No Intersection");
        result.appendPoints(inter1.points);
        result.appendPoints(inter2.points);
        result.appendPoints(inter3.points);
        result.appendPoints(inter4.points);
        if (result.points.length > 0) {
            result.status = "Intersection";
        } else {
            result.status = inter1.status;
        }
        return result;
    }
    /**
     *  intersectEllipseEllipse
     *
     *  This code is based on MgcIntr2DElpElp.cpp written by David Eberly.  His
     *  code along with many other excellent examples are avaiable at his site:
     *  http://www.magic-software.com
     *
     *  NOTE: Rotation will need to be added to this function
     *
     *  @param {Point2D} c1
     *  @param {Number} rx1
     *  @param {Number} ry1
     *  @param {Point2D} c2
     *  @param {Number} rx2
     *  @param {Number} ry2
     *  @returns {Intersection}
     */
    static intersectEllipseEllipse(c1: Point2D, rx1: number, ry1: number, c2: Point2D, rx2: number, ry2: number): Intersection {
        let a = [
            ry1 * ry1, 0, rx1 * rx1, -2 * ry1 * ry1 * c1.x, -2 * rx1 * rx1 * c1.y,
            ry1 * ry1 * c1.x * c1.x + rx1 * rx1 * c1.y * c1.y - rx1 * rx1 * ry1 * ry1
        ];
        let b = [
            ry2 * ry2, 0, rx2 * rx2, -2 * ry2 * ry2 * c2.x, -2 * rx2 * rx2 * c2.y,
            ry2 * ry2 * c2.x * c2.x + rx2 * rx2 * c2.y * c2.y - rx2 * rx2 * ry2 * ry2
        ];
        let yPoly = Intersection.bezout(a, b);
        let yRoots = yPoly.getRoots();
        let epsilon = 1e-3;
        let norm0 = (a[0] * a[0] + 2 * a[1] * a[1] + a[2] * a[2]) * epsilon;
        let norm1 = (b[0] * b[0] + 2 * b[1] * b[1] + b[2] * b[2]) * epsilon;
        let result = new Intersection("No Intersection");
        for (let y = 0; y < yRoots.length; y++) {
            let xPoly = new Polynomial(a[0], a[3] + yRoots[y] * a[1], a[5] + yRoots[y] * (a[4] + yRoots[y] * a[2]));
            let xRoots = xPoly.getRoots();
            for (let x = 0; x < xRoots.length; x++) {
                let test = (a[0] * xRoots[x] + a[1] * yRoots[y] + a[3]) * xRoots[x] +
                    (a[2] * yRoots[y] + a[4]) * yRoots[y] + a[5];
                if (Math.abs(test) < norm0) {
                    test =
                        (b[0] * xRoots[x] + b[1] * yRoots[y] + b[3]) * xRoots[x] +
                        (b[2] * yRoots[y] + b[4]) * yRoots[y] + b[5];
                    if (Math.abs(test) < norm1) {
                        result.appendPoint(new Point2D(xRoots[x], yRoots[y]));
                    }
                }
            }
        }
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    }
    /**
     *  intersectEllipseLine
     *
     *  NOTE: Rotation will need to be added to this function
     *
     *  @param {Point2D} c
     *  @param {Number} rx
     *  @param {Number} ry
     *  @param {Point2D} a1
     *  @param {Point2D} a2
     *  @returns {Intersection}
     */
    static intersectEllipseLine(c: Point2D, rx: number, ry: number, a1: Point2D, a2: Point2D): Intersection {
        let result;
        let origin = new Vector2D(a1.x, a1.y);
        let dir = Vector2D.fromPoints(a1, a2);
        let center = new Vector2D(c.x, c.y);
        let diff = origin.subtract(center);
        let mDir = new Vector2D(dir.x / (rx * rx), dir.y / (ry * ry));
        let mDiff = new Vector2D(diff.x / (rx * rx), diff.y / (ry * ry));
        let a = dir.dot(mDir);
        let b = dir.dot(mDiff);
        let cc = diff.dot(mDiff) - 1.0;
        let d = b * b - a * cc;
        if (d < 0) {
            result = new Intersection("Outside");
        } else if (d > 0) {
            let root = Math.sqrt(d);
            let t_a = (-b - root) / a;
            let t_b = (-b + root) / a;
            if ((t_a < 0 || 1 < t_a) && (t_b < 0 || 1 < t_b)) {
                if ((t_a < 0 && t_b < 0) || (t_a > 1 && t_b > 1)) {
                    result = new Intersection("Outside");
                } else {
                    result = new Intersection("Inside");
                }
            } else {
                result = new Intersection("Intersection");
                if (0 <= t_a && t_a <= 1) {
                    result.appendPoint(a1.lerp(a2, t_a));
                }
                if (0 <= t_b && t_b <= 1) {
                    result.appendPoint(a1.lerp(a2, t_b));
                }
            }
        } else {
            let t = -b / a;
            if (0 <= t && t <= 1) {
                result = new Intersection("Intersection");
                result.appendPoint(a1.lerp(a2, t));
            } else {
                result = new Intersection("Outside");
            }
        }
        return result;
    }
    /**
     *  intersectEllipsePolygon
     *
     *  @param {Point2D} c
     *  @param {Number} rx
     *  @param {Number} ry
     *  @param {Array<Point2D>} c2
     *  @returns {Intersection}
     */
    static intersectEllipsePolygon(c: Point2D, rx: number, ry: number, points): Intersection {
        return this.intersectEllipsePolyline(c, rx, ry, closePolygon(points));
    }
    /**
     *  intersectEllipsePolyline
     *
     *  @param {Point2D} c
     *  @param {Number} rx
     *  @param {Number} ry
     *  @param {Array<Point2D>} c2
     *  @returns {Intersection}
     */
    static intersectEllipsePolyline(c: Point2D, rx: number, ry: number, points): Intersection {
        let result = new Intersection("No Intersection");
        let length = points.length;
        for (let i = 0; i < length - 1; i++) {
            let b1 = points[i];
            let b2 = points[i + 1];
            let inter = Intersection.intersectEllipseLine(c, rx, ry, b1, b2);
            result.appendPoints(inter.points);
        }
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    }
    /**
     *  intersectEllipseRectangle
     *
     *  @param {Point2D} c
     *  @param {Number} rx
     *  @param {Number} ry
     *  @param {Point2D} r1
     *  @param {Point2D} r2
     *  @returns {Intersection}
     */
    static intersectEllipseRectangle(c: Point2D, rx: number, ry: number, r1: Point2D, r2: Point2D): Intersection {
        let min = r1.min(r2);
        let max = r1.max(r2);
        let topRight = new Point2D(max.x, min.y);
        let bottomLeft = new Point2D(min.x, max.y);
        let inter1 = Intersection.intersectEllipseLine(c, rx, ry, min, topRight);
        let inter2 = Intersection.intersectEllipseLine(c, rx, ry, topRight, max);
        let inter3 = Intersection.intersectEllipseLine(c, rx, ry, max, bottomLeft);
        let inter4 = Intersection.intersectEllipseLine(c, rx, ry, bottomLeft, min);
        let result = new Intersection("No Intersection");
        result.appendPoints(inter1.points);
        result.appendPoints(inter2.points);
        result.appendPoints(inter3.points);
        result.appendPoints(inter4.points);
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    }
    /**
     *  intersectLineLine
     *
     *  @param {Point2D} a1
     *  @param {Point2D} a2
     *  @param {Point2D} b1
     *  @param {Point2D} b2
     *  @returns {Intersection}
     */
    static intersectLineLine(a1: Point2D, a2: Point2D, b1: Point2D, b2: Point2D): Intersection {
        let result;
        let ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
        let ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
        let u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
        if (u_b != 0) {
            let ua = ua_t / u_b;
            let ub = ub_t / u_b;
            if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
                result = new Intersection("Intersection");
                result.points.push(new Point2D(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)));
            } else {
                result = new Intersection("No Intersection");
            }
        } else {
            if (ua_t == 0 || ub_t == 0) {
                result = new Intersection("Coincident");
            } else {
                result = new Intersection("Parallel");
            }
        }
        return result;
    }
    /**
     *  intersectLinePolygon
     *
     *  @param {Point2D} a1
     *  @param {Point2D} a2
     *  @param {Array<Point2D>} points
     *  @returns {Intersection}
     */
    static intersectLinePolygon(a1: Point2D, a2: Point2D, points: Array<Point2D>): Intersection {
        return this.intersectLinePolyline(a1, a2, closePolygon(points));
    }
    /**
     *  intersectLinePolyline
     *
     *  @param {Point2D} a1
     *  @param {Point2D} a2
     *  @param {Array<Point2D>} points
     *  @returns {Intersection}
     */
    static intersectLinePolyline(a1: Point2D, a2: Point2D, points: Array<Point2D>): Intersection {
        let result = new Intersection("No Intersection");
        let length = points.length;
        for (let i = 0; i < length - 1; i++) {
            let b1 = points[i];
            let b2 = points[i + 1];
            let inter = Intersection.intersectLineLine(a1, a2, b1, b2);
            result.appendPoints(inter.points);
        }
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    }
    /**
     *  intersectLineRectangle
     *
     *  @param {Point2D} a1
     *  @param {Point2D} a2
     *  @param {Point2D} r1
     *  @param {Point2D} r2
     *  @returns {Intersection}
     */
    static intersectLineRectangle(a1: Point2D, a2: Point2D, r1: Point2D, r2: Point2D): Intersection {
        let min = r1.min(r2);
        let max = r1.max(r2);
        let topRight = new Point2D(max.x, min.y);
        let bottomLeft = new Point2D(min.x, max.y);
        let inter1 = Intersection.intersectLineLine(min, topRight, a1, a2);
        let inter2 = Intersection.intersectLineLine(topRight, max, a1, a2);
        let inter3 = Intersection.intersectLineLine(max, bottomLeft, a1, a2);
        let inter4 = Intersection.intersectLineLine(bottomLeft, min, a1, a2);
        let result = new Intersection("No Intersection");
        result.appendPoints(inter1.points);
        result.appendPoints(inter2.points);
        result.appendPoints(inter3.points);
        result.appendPoints(inter4.points);
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    }
    /**
     *  intersectPolygonPolygon
     *
     *  @param {Array<Point2D>} points1
     *  @param {Array<Point2D>} points2
     *  @returns {Intersection}
     */
    static intersectPolygonPolygon(points1: Array<Point2D>, points2: Array<Point2D>): Intersection {
        return this.intersectPolylinePolyline(closePolygon(points1), closePolygon(points2));
    }
    /**
     *  intersectPolygonPolyline
     *
     *  @param {Array<Point2D>} points1
     *  @param {Array<Point2D>} points2
     *  @returns {Intersection}
     */
    static intersectPolygonPolyline(points1: Array<Point2D>, points2: Array<Point2D>): Intersection {
        return this.intersectPolylinePolyline(closePolygon(points1), points2);
    }
    /**
     *  intersectPolygonRectangle
     *
     *  @param {Array<Point2D>} points
     *  @param {Point2D} r1
     *  @param {Point2D} r2
     *  @returns {Intersection}
     */
    static intersectPolygonRectangle(points: Array<Point2D>, r1: Point2D, r2: Point2D): Intersection {
        return this.intersectPolylineRectangle(closePolygon(points), r1, r2);
    }
    /**
     *  intersectPolylinePolyline
     *
     *  @param {Array<Point2D>} points1
     *  @param {Array<Point2D>} points2
     *  @returns {Intersection}
     */
    static intersectPolylinePolyline(points1: Array<Point2D>, points2: Array<Point2D>): Intersection {
        let result = new Intersection("No Intersection");
        let length = points1.length;
        for (let i = 0; i < length - 1; i++) {
            let a1 = points1[i];
            let a2 = points1[i + 1];
            let inter = Intersection.intersectLinePolyline(a1, a2, points2);
            result.appendPoints(inter.points);
        }
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    }
    /**
     *  intersectPolylineRectangle
     *
     *  @param {Array<Point2D>} points
     *  @param {Point2D} r1
     *  @param {Point2D} r2
     *  @returns {Intersection}
     */
    static intersectPolylineRectangle(points: Array<Point2D>, r1: Point2D, r2: Point2D): Intersection {
        let min = r1.min(r2);
        let max = r1.max(r2);
        let topRight = new Point2D(max.x, min.y);
        let bottomLeft = new Point2D(min.x, max.y);
        let inter1 = Intersection.intersectLinePolyline(min, topRight, points);
        let inter2 = Intersection.intersectLinePolyline(topRight, max, points);
        let inter3 = Intersection.intersectLinePolyline(max, bottomLeft, points);
        let inter4 = Intersection.intersectLinePolyline(bottomLeft, min, points);
        let result = new Intersection("No Intersection");
        result.appendPoints(inter1.points);
        result.appendPoints(inter2.points);
        result.appendPoints(inter3.points);
        result.appendPoints(inter4.points);
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    }
    /**
     *  intersectRectangleRectangle
     *
     *  @param {Point2D} a1
     *  @param {Point2D} a2
     *  @param {Point2D} b1
     *  @param {Point2D} b2
     *  @returns {Intersection}
     */
    static intersectRectangleRectangle(a1: Point2D, a2: Point2D, b1: Point2D, b2: Point2D): Intersection {
        let min = a1.min(a2);
        let max = a1.max(a2);
        let topRight = new Point2D(max.x, min.y);
        let bottomLeft = new Point2D(min.x, max.y);
        let inter1 = Intersection.intersectLineRectangle(min, topRight, b1, b2);
        let inter2 = Intersection.intersectLineRectangle(topRight, max, b1, b2);
        let inter3 = Intersection.intersectLineRectangle(max, bottomLeft, b1, b2);
        let inter4 = Intersection.intersectLineRectangle(bottomLeft, min, b1, b2);
        let result = new Intersection("No Intersection");
        result.appendPoints(inter1.points);
        result.appendPoints(inter2.points);
        result.appendPoints(inter3.points);
        result.appendPoints(inter4.points);
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    }
    /**
     *  intersectRayRay
     *
     *  @param {Point2D} a1
     *  @param {Point2D} a2
     *  @param {Point2D} b1
     *  @param {Point2D} b2
     *  @returns {Intersection}
     */
    static intersectRayRay(a1: Point2D, a2: Point2D, b1: Point2D, b2: Point2D): Intersection {
        let result;
        let ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
        let ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
        let u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
        if (u_b != 0) {
            let ua = ua_t / u_b;
            result = new Intersection("Intersection");
            result.points.push(new Point2D(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)));
        } else {
            if (ua_t == 0 || ub_t == 0) {
                result = new Intersection("Coincident");
            } else {
                result = new Intersection("Parallel");
            }
        }
        return result;
    }
    /**
     *  bezout
     *
     *  This code is based on MgcIntr2DElpElp.cpp written by David Eberly.  His
     *  code along with many other excellent examples are avaiable at his site:
     *  http://www.magic-software.com
     *
     *  @param {number[]} e1
     *  @param {number[]} e2
     *  @returns {Polynomial}
     */
    static bezout(e1: number[], e2: number[]): Polynomial {
        let AB = e1[0] * e2[1] - e2[0] * e1[1];
        let AC = e1[0] * e2[2] - e2[0] * e1[2];
        let AD = e1[0] * e2[3] - e2[0] * e1[3];
        let AE = e1[0] * e2[4] - e2[0] * e1[4];
        let AF = e1[0] * e2[5] - e2[0] * e1[5];
        let BC = e1[1] * e2[2] - e2[1] * e1[2];
        let BE = e1[1] * e2[4] - e2[1] * e1[4];
        let BF = e1[1] * e2[5] - e2[1] * e1[5];
        let CD = e1[2] * e2[3] - e2[2] * e1[3];
        let DE = e1[3] * e2[4] - e2[3] * e1[4];
        let DF = e1[3] * e2[5] - e2[3] * e1[5];
        let BFpDE = BF + DE;
        let BEmCD = BE - CD;
        return new Polynomial(AB * BC - AC * AC, AB * BEmCD + AD * BC - 2 * AC * AE, AB * BFpDE + AD * BEmCD - AE * AE - 2 * AC * AF, AB * DF + AD * BFpDE - 2 * AE * AF, AD * DF - AF * AF);
    }
}

export default Intersection;
