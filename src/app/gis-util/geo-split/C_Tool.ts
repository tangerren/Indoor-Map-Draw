import Intersection from '../kld-intersections/Intersection';
import { Polygon, LineString, Position } from 'geojson';
import Point2D from '../kld-affine/Point2D';



class CTool {

	/**
	 * 返回坐标数组。如果有传参数，就处理传入的要素，否则默认处理被分隔要素
	 * @param {*} geo
	 */
	static getSafeCoords(geometry: Polygon | LineString) {
		let coords: Position[];
		if (geometry.type == "Polygon") {
			[coords] = geometry.coordinates;
		} else {
			coords = geometry.coordinates;
		}
		return coords;
	}

	/**
	 * 将geometry转换为 Intersection库所需的 Point2d 数组
	 * @param {*} geo geometry
	 */
	static getPoint2dFromCoords(geo: Polygon | LineString): Point2D[] {
		let points: Point2D[] = [];
		let flatGeo = this.getSafeCoords(geo);
		flatGeo.forEach((coord) => points.push(new Point2D(coord[0], coord[1])));
		return points;
	}

	/**
	 * 将 Intersection库所需的 Point2d 数组转换为 geometry
	 * @param {*} points
	 */
	static getCoordsFromPoints(points: Point2D[]) {
		let coords: Position[] = [];
		points.forEach((point2d) => coords.push([point2d.x, point2d.y]));
		return coords;
	}


	/**
	 * 获取相交的点
	 * @param {*} toolGeo 用于切割的要素
	 */
	static getPolygonPolylineIntersectPoints(targetGeo: Polygon | LineString, toolGeo: LineString) {
		const polygon = CTool.getPoint2dFromCoords(targetGeo);
		const polyline = CTool.getPoint2dFromCoords(toolGeo);
		const {
			points
		} = Intersection.intersectPolygonPolyline(polygon, polyline);
		return points;
	}


	/**
   *  判断一个点是否在多边形内部
   *  @param points 多边形坐标集合
   *  @param point 测试点坐标
   *  */
	static insidePolygon(points: Position[], point: Position) {
		// testPoint 是[0,0]的时候有bug
		let x = point[0], y = point[1];
		let inside = false;
		for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
			let xi = points[i][0], yi = points[i][1];
			let xj = points[j][0], yj = points[j][1];
			let intersect = ((yi > y) !== (yj > y))
				&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
			if (intersect) inside = !inside;
		}
		return inside;
	}
}

export default CTool;
