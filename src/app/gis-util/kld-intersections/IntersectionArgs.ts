import Point2D from "../kld-affine/Point2D";

class IntersectionArgs {
	name: any;
	args: any;
	/**
	 *
	 *  @param {String} name
	 *  @param {Array<Point2D} args
	 */
	constructor(name: string, args: Array<Point2D>) {
		this.init(name, args);
	}
	/**
	 *  init
	 *
	 *  @param {String} name
	 *  @param {Array<Point2D>} args
	 */
	init(name: string, args: Array<Point2D>) {
		this.name = name;
		this.args = args;
	}
}
export default IntersectionArgs;
