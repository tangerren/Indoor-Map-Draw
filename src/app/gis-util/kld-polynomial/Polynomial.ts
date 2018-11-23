/**
 *  Sign of a number (+1, -1, +0, -0).
 */
function sign(x) {
    return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? x : NaN : NaN;
};


class Polynomial {
    TOLERANCE = 1e-6;
    ACCURACY = 15;

    coefs: any[];
    _letiable: string;
    _s: number;


    constructor(...params) {
        this.init(params);
    };

    /**
     *  init
     */
    init(coefs) {
        this.coefs = new Array();
        for (let i = coefs.length - 1; i >= 0; i--)
            this.coefs.push(coefs[i]);
        this._letiable = "t";
        this._s = 0;
    }
    /**
     *  eval
     */
    eval(x) {
        if (isNaN(x)) {
            throw new Error("Polynomial.eval: parameter must be a number");
        }
        let result = 0;
        for (let i = this.coefs.length - 1; i >= 0; i--) {
            result = result * x + this.coefs[i];
        }
        return result;
    }
    /**
     *  add
     */
    add(that) {
        let result = new Polynomial();
        let d1 = this.getDegree();
        let d2 = that.getDegree();
        let dmax = Math.max(d1, d2);
        for (let i = 0; i <= dmax; i++) {
            let v1 = (i <= d1) ? this.coefs[i] : 0;
            let v2 = (i <= d2) ? that.coefs[i] : 0;
            result.coefs[i] = v1 + v2;
        }
        return result;
    }
    /**
     *  multiply
     */
    multiply(that) {
        let result = new Polynomial();
        for (let i = 0; i <= this.getDegree() + that.getDegree(); i++) {
            result.coefs.push(0);
        }
        for (let i = 0; i <= this.getDegree(); i++) {
            for (let j = 0; j <= that.getDegree(); j++) {
                result.coefs[i + j] += this.coefs[i] * that.coefs[j];
            }
        }
        return result;
    }
    /**
     *  divide_scalar
     */
    divide_scalar(scalar) {
        for (let i = 0; i < this.coefs.length; i++) {
            this.coefs[i] /= scalar;
        }
    }
    /**
     *  simplify
     */
    simplify(TOLERANCE?) {
        if (TOLERANCE === undefined)
            TOLERANCE = 1e-12;
        for (let i = this.getDegree(); i >= 0; i--) {
            if (Math.abs(this.coefs[i]) <= TOLERANCE) {
                this.coefs.pop();
            } else {
                break;
            }
        }
    }
    /**
     *  bisection
     */
    bisection(min, max) {
        let minValue = this.eval(min);
        let maxValue = this.eval(max);
        let result;
        if (Math.abs(minValue) <= this.TOLERANCE) {
            result = min;
        } else if (Math.abs(maxValue) <= this.TOLERANCE) {
            result = max;
        } else if (minValue * maxValue <= 0) {
            let tmp1 = Math.log(max - min);
            let tmp2 = Math.LN10 * this.ACCURACY;
            let iters = Math.ceil((tmp1 + tmp2) / Math.LN2);
            for (let i = 0; i < iters; i++) {
                result = 0.5 * (min + max);
                let value = this.eval(result);
                if (Math.abs(value) <= this.TOLERANCE) {
                    break;
                }
                if (value * minValue < 0) {
                    max = result;
                    maxValue = value;
                } else {
                    min = result;
                    minValue = value;
                }
            }
        }
        return result;
    }
    /**
     *  toString
     */
    toString() {
        let coefs = new Array();
        let signs = new Array();
        for (let i = this.coefs.length - 1; i >= 0; i--) {
            let value: number | string;
            value = Math.round(this.coefs[i] * 1000) / 1000;
            //let value = this.coefs[i];
            if (value != 0) {
                let sign = (value < 0) ? " - " : " + ";
                value = Math.abs(value);
                if (i > 0) {
                    if (value == 1) {
                        value = this._letiable;
                    } else {
                        value = value + this._letiable;
                    }
                }
                if (i > 1) {
                    value += "^" + i;
                }
                signs.push(sign);
                coefs.push(value);
            }
        }
        signs[0] = (signs[0] == " + ") ? "" : "-";
        let result = "";
        for (let i = 0; i < coefs.length; i++) {
            result += signs[i] + coefs[i];
        }
        return result;
    }
    /**
     *  trapezoid
     *
     *  Based on trapzd in "Numerical Recipes in C, 2nd Edition", page 137
     */
    trapezoid(min, max, n) {
        if (isNaN(min) || isNaN(max) || isNaN(n)) {
            throw new Error("Polynomial.trapezoid: parameters must be numbers");
        }
        let range = max - min;
        let TOLERANCE = 1e-7;
        if (n == 1) {
            let minValue = this.eval(min);
            let maxValue = this.eval(max);
            this._s = 0.5 * range * (minValue + maxValue);
        } else {
            let it = 1 << (n - 2);
            let delta = range / it;
            let x = min + 0.5 * delta;
            let sum = 0;
            for (let i = 0; i < it; i++) {
                sum += this.eval(x);
                x += delta;
            }
            this._s = 0.5 * (this._s + range * sum / it);
        }
        if (isNaN(this._s)) {
            throw new Error("Polynomial.trapezoid: this._s is NaN");
        }
        return this._s;
    }
    /**
     *  simpson
     *
     *  Based on trapzd in "Numerical Recipes in C, 2nd Edition", page 139
     */
    simpson(min, max) {
        if (isNaN(min) || isNaN(max)) {
            throw new Error("Polynomial.simpson: parameters must be numbers");
        }
        let range = max - min;
        let st = 0.5 * range * (this.eval(min) + this.eval(max));
        let t = st;
        let s = 4.0 * st / 3.0;
        let os = s;
        let ost = st;
        let TOLERANCE = 1e-7;
        let it = 1;
        for (let n = 2; n <= 20; n++) {
            let delta = range / it;
            let x = min + 0.5 * delta;
            let sum = 0;
            for (let i = 1; i <= it; i++) {
                sum += this.eval(x);
                x += delta;
            }
            t = 0.5 * (t + range * sum / it);
            st = t;
            s = (4.0 * st - ost) / 3.0;
            if (Math.abs(s - os) < TOLERANCE * Math.abs(os)) {
                break;
            }
            os = s;
            ost = st;
            it <<= 1;
        }
        return s;
    }
    /**
     *  romberg
     */
    romberg(min, max) {
        if (isNaN(min) || isNaN(max)) {
            throw new Error("Polynomial.romberg: parameters must be numbers");
        }
        let MAX = 20;
        let K = 3;
        let TOLERANCE = 1e-6;
        let s = new Array(MAX + 1);
        let h = new Array(MAX + 1);
        let result = {
            y: 0,
            dy: 0
        };
        h[0] = 1.0;
        for (let j = 1; j <= MAX; j++) {
            s[j - 1] = this.trapezoid(min, max, j);
            if (j >= K) {
                result = Polynomial.interpolate(h, s, K, j - K, 0.0);
                if (Math.abs(result.dy) <= TOLERANCE * result.y)
                    break;
            }
            s[j] = s[j - 1];
            h[j] = 0.25 * h[j - 1];
        }
        return result.y;
    }
    // getters and setters
    /**
     *  get degree
     */
    getDegree() {
        return this.coefs.length - 1;
    }
    /**
     *  getDerivative
     */
    getDerivative() {
        let derivative = new Polynomial();
        for (let i = 1; i < this.coefs.length; i++) {
            derivative.coefs.push(i * this.coefs[i]);
        }
        return derivative;
    }
    /**
     *  getRoots
     */
    getRoots() {
        let result;
        this.simplify();
        switch (this.getDegree()) {
            case 0:
                result = [];
                break;
            case 1:
                result = this.getLinearRoot();
                break;
            case 2:
                result = this.getQuadraticRoots();
                break;
            case 3:
                result = this.getCubicRoots();
                break;
            case 4:
                result = this.getQuarticRoots();
                break;
            default:
                result = [];
        }
        return result;
    }
    /**
     *  getRootsInInterval
     */
    getRootsInInterval(min, max) {
        let roots = new Array();
        let root;
        if (this.getDegree() == 1) {
            root = this.bisection(min, max);
            if (root != null) {
                roots.push(root);
            }
        } else {
            // get roots of derivative
            let deriv = this.getDerivative();
            let droots = deriv.getRootsInInterval(min, max);
            if (droots.length > 0) {
                // find root on [min, droots[0]]
                root = this.bisection(min, droots[0]);
                if (root != null) {
                    roots.push(root);
                }
                // find root on [droots[i],droots[i+1]] for 0 <= i <= count-2
                for (let i = 0; i <= droots.length - 2; i++) {
                    root = this.bisection(droots[i], droots[i + 1]);
                    if (root != null) {
                        roots.push(root);
                    }
                }
                // find root on [droots[count-1],xmax]
                root = this.bisection(droots[droots.length - 1], max);
                if (root != null) {
                    roots.push(root);
                }
            } else {
                // polynomial is monotone on [min,max], has at most one root
                root = this.bisection(min, max);
                if (root != null) {
                    roots.push(root);
                }
            }
        }
        return roots;
    }
    /**
     *  getLinearRoot
     */
    getLinearRoot() {
        let result = [];
        let a = this.coefs[1];
        if (a != 0) {
            result.push(-this.coefs[0] / a);
        }
        return result;
    }
    /**
     *  getQuadraticRoots
     */
    getQuadraticRoots() {
        let results = [];
        if (this.getDegree() == 2) {
            let a = this.coefs[2];
            let b = this.coefs[1] / a;
            let c = this.coefs[0] / a;
            let d = b * b - 4 * c;
            if (d > 0) {
                let e = Math.sqrt(d);
                results.push(0.5 * (-b + e));
                results.push(0.5 * (-b - e));
            } else if (d == 0) {
                // really two roots with same value, but we only return one
                results.push(0.5 * -b);
            }
        }
        return results;
    }
    /**
     *  getCubicRoots
     *
     *  This code is based on MgcPolynomial.cpp written by David Eberly.  His
     *  code along with many other excellent examples are avaiable at his site:
     *  http://www.geometrictools.com
     */
    getCubicRoots() {
        let results = [];
        if (this.getDegree() == 3) {
            let c3 = this.coefs[3];
            let c2 = this.coefs[2] / c3;
            let c1 = this.coefs[1] / c3;
            let c0 = this.coefs[0] / c3;
            let a = (3 * c1 - c2 * c2) / 3;
            let b = (2 * c2 * c2 * c2 - 9 * c1 * c2 + 27 * c0) / 27;
            let offset = c2 / 3;
            let discrim = b * b / 4 + a * a * a / 27;
            let halfB = b / 2;
            let ZEROepsilon = this.zeroErrorEstimate();
            if (Math.abs(discrim) <= ZEROepsilon) {
                discrim = 0;
            }
            if (discrim > 0) {
                let e = Math.sqrt(discrim);
                let tmp;
                let root;
                tmp = -halfB + e;
                if (tmp >= 0) {
                    root = Math.pow(tmp, 1 / 3);
                } else {
                    root = -Math.pow(-tmp, 1 / 3);
                }
                tmp = -halfB - e;
                if (tmp >= 0) {
                    root += Math.pow(tmp, 1 / 3);
                } else {
                    root -= Math.pow(-tmp, 1 / 3);
                }
                results.push(root - offset);
            } else if (discrim < 0) {
                let distance = Math.sqrt(-a / 3);
                let angle = Math.atan2(Math.sqrt(-discrim), -halfB) / 3;
                let cos = Math.cos(angle);
                let sin = Math.sin(angle);
                let sqrt3 = Math.sqrt(3);
                results.push(2 * distance * cos - offset);
                results.push(-distance * (cos + sqrt3 * sin) - offset);
                results.push(-distance * (cos - sqrt3 * sin) - offset);
            } else {
                let tmp;
                if (halfB >= 0) {
                    tmp = -Math.pow(halfB, 1 / 3);
                } else {
                    tmp = Math.pow(-halfB, 1 / 3);
                }
                results.push(2 * tmp - offset);
                // really should return next root twice, but we return only one
                results.push(-tmp - offset);
            }
        }
        return results;
    }
    /**
     *  Calculates roots of quartic polynomial. <br/>
     *  First, derivative roots are found, then used to split quartic polynomial
     *  into segments, each containing one root of quartic polynomial.
     *  Segments are then passed to newton's method to find roots.
     *
     *  @returns {Array<Number>} roots
     */
    getQuarticRoots(): Array<number> {
        let results = [];
        let n = this.getDegree();
        if (n == 4) {
            let poly = new Polynomial();
            poly.coefs = this.coefs.slice();
            poly.divide_scalar(poly.coefs[n]);
            let ERRF = 1e-15;
            if (Math.abs(poly.coefs[0]) < 10 * ERRF * Math.abs(poly.coefs[3])) {
                poly.coefs[0] = 0;
            }
            let poly_d = poly.getDerivative();
            let derrt = poly_d.getRoots().sort(function (a, b) {
                return a - b;
            });
            let dery = [];
            let nr = derrt.length - 1;
            let i;
            let rb = this.bounds();
            let maxabsX = Math.max(Math.abs(rb.minX), Math.abs(rb.maxX));
            let ZEROepsilon = this.zeroErrorEstimate(maxabsX);
            for (i = 0; i <= nr; i++) {
                dery.push(poly.eval(derrt[i]));
            }
            for (i = 0; i <= nr; i++) {
                if (Math.abs(dery[i]) < ZEROepsilon) {
                    dery[i] = 0;
                }
            }
            i = 0;
            let dx = Math.max(0.1 * (rb.maxX - rb.minX) / n, ERRF);
            let guesses = [];
            let minmax = [];
            if (nr > -1) {
                if (dery[0] != 0) {
                    if (sign(dery[0]) != sign(poly.eval(derrt[0] - dx) - dery[0])) {
                        guesses.push(derrt[0] - dx);
                        minmax.push([rb.minX, derrt[0]]);
                    }
                } else {
                    results.push(derrt[0], derrt[0]);
                    i++;
                }
                for (; i < nr; i++) {
                    if (dery[i + 1] == 0) {
                        results.push(derrt[i + 1], derrt[i + 1]);
                        i++;
                    } else if (sign(dery[i]) != sign(dery[i + 1])) {
                        guesses.push((derrt[i] + derrt[i + 1]) / 2);
                        minmax.push([derrt[i], derrt[i + 1]]);
                    }
                }
                if (dery[nr] != 0 && sign(dery[nr]) != sign(poly.eval(derrt[nr] + dx) - dery[nr])) {
                    guesses.push(derrt[nr] + dx);
                    minmax.push([derrt[nr], rb.maxX]);
                }
            }
            let f = function (x) {
                return poly.eval(x);
            };
            let df = function (x) {
                return poly_d.eval(x);
            };
            if (guesses.length > 0) {
                for (i = 0; i < guesses.length; i++) {
                    guesses[i] = Polynomial.newton_secant_bisection(guesses[i], f, df, 32, minmax[i][0], minmax[i][1]);
                }
            }
            results = results.concat(guesses);
        }
        return results;
    }
    /**
     *  Estimate what is the maximum polynomial evaluation error value under which polynomial evaluation could be in fact 0.
     *
     *  @returns {Number}
     */
    zeroErrorEstimate(maxabsX?): number {
        let poly = this;
        let ERRF = 1e-15;
        if (typeof maxabsX === 'undefined') {
            let rb = poly.bounds();
            maxabsX = Math.max(Math.abs(rb.minX), Math.abs(rb.maxX));
        }
        if (maxabsX < 0.001) {
            return 2 * Math.abs(poly.eval(ERRF));
        }
        let n = poly.coefs.length - 1;
        let an = poly.coefs[n];
        return 10 * ERRF * poly.coefs.reduce(function (m, v, i) {
            let nm = v / an * Math.pow(maxabsX, i);
            return nm > m ? nm : m;
        }, 0);
    }
    /**
     *  Calculates upper Real roots bounds. <br/>
     *  Real roots are in interval [negX, posX]. Determined by Fujiwara method.
     *  @see {@link http://en.wikipedia.org/wiki/Properties_of_polynomial_roots}
     *
     *  @returns {{ negX: Number, posX: Number }}
     */
    bounds_UpperReal_Fujiwara(): { negX: number; posX: number; } {
        let a = this.coefs;
        let n = a.length - 1;
        let an = a[n];
        if (an != 1) {
            a = this.coefs.map(function (v) {
                return v / an;
            });
        }
        let b = a.map(function (v, i) {
            return (i < n) ?
                Math.pow(Math.abs((i == 0) ? v / 2 : v), 1 / (n - i)) :
                v;
        });
        let coefSelectionFunc;
        let find2Max = function (acc, bi, i) {
            if (coefSelectionFunc(i)) {
                if (acc.max < bi) {
                    acc.nearmax = acc.max;
                    acc.max = bi;
                } else if (acc.nearmax < bi) {
                    acc.nearmax = bi;
                }
            }
            return acc;
        };
        coefSelectionFunc = function (i) {
            return i < n && a[i] < 0;
        };
        let max_nearmax_pos = b.reduce(find2Max, {
            max: 0,
            nearmax: 0
        });
        coefSelectionFunc = function (i) {
            return i < n && ((n % 2 == i % 2) ? a[i] < 0 : a[i] > 0);
        };
        let max_nearmax_neg = b.reduce(find2Max, {
            max: 0,
            nearmax: 0
        });
        return {
            negX: -2 * max_nearmax_neg.max,
            posX: 2 * max_nearmax_pos.max
        };
    }
    /**
     *  Calculates lower Real roots bounds. <br/>
     *  There are no Real roots in interval <negX, posX>. Determined by Fujiwara method.
     *  @see {@link http://en.wikipedia.org/wiki/Properties_of_polynomial_roots}
     *
     *  @returns {{ negX: Number, posX: Number }}
     */
    bounds_LowerReal_Fujiwara(): { negX: number; posX: number; } {
        let poly = new Polynomial();
        poly.coefs = this.coefs.slice().reverse();
        let res = poly.bounds_UpperReal_Fujiwara();
        res.negX = 1 / res.negX;
        res.posX = 1 / res.posX;
        return res;
    }
    /**
     *  Calculates left and right Real roots bounds. <br/>
     *  Real roots are in interval [minX, maxX]. Combines Fujiwara lower and upper bounds to get minimal interval.
     *  @see {@link http://en.wikipedia.org/wiki/Properties_of_polynomial_roots}
     *
     *  @returns {{ minX: Number, maxX: Number }}
     */
    bounds(): { minX: number; maxX: number; } {
        let urb = this.bounds_UpperReal_Fujiwara();
        let rb = {
            minX: urb.negX,
            maxX: urb.posX
        };
        if (urb.negX === 0 && urb.posX === 0) {
            return rb;
        }
        if (urb.negX === 0) {
            rb.minX = this.bounds_LowerReal_Fujiwara().posX;
        } else if (urb.posX === 0) {
            rb.maxX = this.bounds_LowerReal_Fujiwara().negX;
        }
        if (rb.minX > rb.maxX) {
            //console.log('Polynomial.prototype.bounds: poly has no real roots? or floating point error?');
            rb.minX = rb.maxX = 0;
        }
        return rb;
        // TODO: if sure that there are no complex roots 
        // (maybe by using Sturm's theorem) use:
        // return this.bounds_Real_Laguerre();
    }
    /**
     *  interpolate
     *
     *  Based on poloint in "Numerical Recipes in C, 2nd Edition", pages 109-110
     *
     *  @param {Array<Number>} xs
     *  @param {Array<Number>} ys
     *  @param {Number} n
     *  @param {Number} offset
     *  @param {Number} x
     *
     *  @returns {{y: Number, dy: Number}}
     */
    static interpolate(xs: Array<number>, ys: Array<number>, n: number, offset: number, x: number): { y: number; dy: number; } {
        if (xs.constructor !== Array || ys.constructor !== Array) {
            throw new Error("Polynomial.interpolate: xs and ys must be arrays");
        }
        if (isNaN(n) || isNaN(offset) || isNaN(x)) {
            throw new Error("Polynomial.interpolate: n, offset, and x must be numbers");
        }
        let y = 0;
        let dy = 0;
        let c = new Array(n);
        let d = new Array(n);
        let ns = 0;
        let diff = Math.abs(x - xs[offset]);
        for (let i = 0; i < n; i++) {
            let dift = Math.abs(x - xs[offset + i]);
            if (dift < diff) {
                ns = i;
                diff = dift;
            }
            c[i] = d[i] = ys[offset + i];
        }
        y = ys[offset + ns];
        ns--;
        for (let m = 1; m < n; m++) {
            for (let i = 0; i < n - m; i++) {
                let ho = xs[offset + i] - x;
                let hp = xs[offset + i + m] - x;
                let w = c[i + 1] - d[i];
                let den = ho - hp;
                if (den == 0.0) {
                    throw new Error("Unable to interpolate polynomial. Two numbers in n were identical (to within roundoff)");
                }
                den = w / den;
                d[i] = hp * den;
                c[i] = ho * den;
            }
            dy = (2 * (ns + 1) < (n - m)) ? c[ns + 1] : d[ns--];
            y += dy;
        }
        return {
            y: y,
            dy: dy
        };
    }
    /**
     *  Newton's (Newton-Raphson) method for finding Real roots on uniletiate function. <br/>
     *  When using bounds, algorithm falls back to secant if newton goes out of range.
     *  Bisection is fallback for secant when determined secant is not efficient enough.
     *  @see {@link http://en.wikipedia.org/wiki/Newton%27s_method}
     *  @see {@link http://en.wikipedia.org/wiki/Secant_method}
     *  @see {@link http://en.wikipedia.org/wiki/Bisection_method}
     *
     *  @param {Number} x0 - Inital root guess
     *  @param {function(x)} f - Function which root we are trying to find
     *  @param {function(x)} df - Derivative of function f
     *  @param {Number} max_iterations - Maximum number of algorithm iterations
     *  @param {Number} [min_x] - Left bound value
     *  @param {Number} [max_x] - Right bound value
     *  @returns {Number} - root
     */
    static newton_secant_bisection(x0, f, df, max_iterations, min, max) {
        let x, prev_dfx = 0,
            dfx, prev_x_ef_correction = 0,
            x_correction, x_new;
        let y, y_atmin, y_atmax;
        x = x0;
        let ACCURACY = 14;
        let min_correction_factor = Math.pow(10, -ACCURACY);
        let isBounded = (typeof min === 'number' && typeof max === 'number');
        if (isBounded) {
            if (min > max) {
                throw new Error("newton root finding: min must be greater than max");
            }
            y_atmin = f(min);
            y_atmax = f(max);
            if (sign(y_atmin) == sign(y_atmax)) {
                throw new Error("newton root finding: y values of bounds must be of opposite sign");
            }
        }
        let isEnoughCorrection = function () {
            // stop if correction is too small or if correction is in simple loop
            return (Math.abs(x_correction) <= min_correction_factor * Math.abs(x)) ||
                (prev_x_ef_correction == (x - x_correction) - x);
        };
        let i;
        for (i = 0; i < max_iterations; i++) {
            dfx = df(x);
            if (dfx == 0) {
                if (prev_dfx == 0) {
                    // error
                    throw new Error("newton root finding: df(x) is zero");
                } else {
                    // use previous derivation value
                    dfx = prev_dfx;
                }
                // or move x a little?
                //dfx = df(x != 0 ? x + x * 1e-15 : 1e-15);
            }
            prev_dfx = dfx;
            y = f(x);
            x_correction = y / dfx;
            x_new = x - x_correction;
            if (isEnoughCorrection()) {
                break;
            }
            if (isBounded) {
                if (sign(y) == sign(y_atmax)) {
                    max = x;
                    y_atmax = y;
                } else if (sign(y) == sign(y_atmin)) {
                    min = x;
                    y_atmin = y;
                } else {
                    x = x_new;
                    break;
                }
                if ((x_new < min) || (x_new > max)) {
                    if (sign(y_atmin) == sign(y_atmax)) {
                        break;
                    }
                    let RATIO_LIMIT = 50;
                    let AIMED_BISECT_OFFSET = 0.25; // [0, 0.5)
                    let dy = y_atmax - y_atmin;
                    let dx = max - min;
                    if (dy == 0) {
                        x_correction = x - (min + dx * 0.5);
                    } else if (Math.abs(dy / Math.min(y_atmin, y_atmax)) > RATIO_LIMIT) {
                        x_correction = x - (min + dx * (0.5 + (Math.abs(y_atmin) < Math.abs(y_atmax) ? -AIMED_BISECT_OFFSET : AIMED_BISECT_OFFSET)));
                    } else {
                        x_correction = x - (min - y_atmin / dy * dx);
                    }
                    x_new = x - x_correction;
                    if (isEnoughCorrection()) {
                        break;
                    }
                }
            }
            prev_x_ef_correction = x - x_new;
            x = x_new;
        }
        return x;
    }


    /**
     * Clones this polynomial and return the clone.
     */
    clone() {
        let poly = new Polynomial();
        poly.coefs = this.coefs.slice();
        return poly;
    }
    /**
     *Sets small coefficients to zero.
     */
    modify_zeroSmallCoefs() {
        let c = this.coefs;
        let ERRF = 1e-15;
        let err = 10 * ERRF * Math.abs(c.reduce(function (pv, cv) {
            return Math.abs(cv) > Math.abs(pv) ? cv : pv;
        }));
        for (let i = 0; i < c.length - 1; i++) {
            if (Math.abs(c[i]) < err) {
                c[i] = 0;
            }
        }
        return this;
    }
    /**
     *Scales polynomial so that leading coefficient becomes 1.
     */
    modify_toMonic() {
        let c = this.coefs;
        if (c[c.length - 1] !== 1) {
            this.divide_scalar(c[c.length - 1]);
        }
        return this;
    }
    /**
         Calculates absolute upper roots bound. <br/>
         All (Complex and Real) roots magnitudes are &lt;= result. Determined by Rouche method.
         @see {@link http://en.wikipedia.org/wiki/Properties_of_polynomial_roots}
        
         @returns {Number}
     */
    bound_UpperAbs_Rouche(): number {
        let a = this.coefs;
        let n = a.length - 1;
        let max = a.reduce(function (prev, curr, i) {
            if (i != n) {
                curr = Math.abs(curr);
                return (prev < curr) ? curr : prev;
            }
            return prev;
        }, 0);
        return 1 + max / Math.abs(a[n]);
    }
    /**
         Calculates absolute lower roots bound. <br/>
         All (Complex and Real) roots magnitudes are &gt;= result. Determined by Rouche method.
         @see {@link http://en.wikipedia.org/wiki/Properties_of_polynomial_roots}
        
         @returns {Number}
     */
    bound_LowerAbs_Rouche(): number {
        let a = this.coefs;
        let n = a.length - 1;
        let max = a.reduce(function (prev, curr, i) {
            if (i != 0) {
                curr = Math.abs(curr);
                return (prev < curr) ? curr : prev;
            }
            return prev;
        }, 0);
        return Math.abs(a[0]) / (Math.abs(a[0]) + max);
    }
    /**
         Calculates left and right Real roots bounds. <br/>
         WORKS ONLY if all polynomial roots are Real.
         Real roots are in interval [minX, maxX]. Determined by Laguerre method.
         @see {@link http://en.wikipedia.org/wiki/Properties_of_polynomial_roots}
        
         @returns {{ minX: Number, maxX: Number }}
     */
    bounds_Real_Laguerre(): { minX: number; maxX: number; } {
        let a = this.coefs;
        let n = a.length - 1;
        let p1 = -a[n - 1] / (n * a[n]);
        let undersqrt = a[n - 1] * a[n - 1] - 2 * n / (n - 1) * a[n] * a[n - 2];
        let p2 = (n - 1) / (n * a[n]) * Math.sqrt(undersqrt);
        if (p2 < 0)
            p2 = -p2;
        return {
            minX: p1 - p2,
            maxX: p1 + p2
        };
    }
    /**
         Root count by Descartes rule of signs. <br/>
         Returns maximum number of positive and negative real roots and minimum number of complex roots.
         @see {@link http://en.wikipedia.org/wiki/Descartes%27_rule_of_signs}
        
         @returns {{maxRealPos: Number, maxRealNeg: Number, minComplex: Number}}
     */
    countRoots_Descartes(): { maxRealPos: number; maxRealNeg: number; minComplex: number; } {
        let a = this.coefs;
        let n = a.length - 1;
        let acc = a.reduce(function (acc, ai, i) {
            if (acc.prev_a != 0 && ai != 0) {
                if ((acc.prev_a < 0) == (ai > 0)) {
                    acc.pos++;
                }
                if (((i % 2 == 0) != (acc.prev_a < 0)) == ((i % 2 == 1) != (ai > 0))) {
                    acc.neg++;
                }
            }
            acc.prev_a = ai;
            return acc;
        }, {
                pos: 0,
                neg: 0,
                prev_a: 0
            });
        return {
            maxRealPos: acc.pos,
            maxRealNeg: acc.neg,
            minComplex: n - (acc.pos + acc.neg)
        };
    }
}

export default Polynomial;