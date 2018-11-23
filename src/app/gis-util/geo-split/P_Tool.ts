import { isEqual, unionWith } from 'lodash';
import PolygonC from './Polygon';
import LineStringC from './LineString';

import CTool from "./C_Tool";


class PTool {


	/**
	 * 处理用于切割的要素（理解为polyline），获得相交之后的结果（polyline）
	 * @param {*} targets 
	 */
	static getCrossLine(targetGeo: PolygonC, toolGeo: LineStringC): LineStringC[] {
		let avail = [];
		let avails = [];
		let one = false;
		const coords = CTool.getSafeCoords(toolGeo);
		// 对要素中的子要素进行逐一判断（判断polyline中的每一个line）
		for (let i = 0; i < coords.length; i++) {
			if (one) {
				avail = unionWith(avail, [coords[i]], isEqual)
				const lastStartInner = CTool.insidePolygon(CTool.getSafeCoords(targetGeo), coords[i - 1])
				const lastEndOuter = !CTool.insidePolygon(CTool.getSafeCoords(targetGeo), coords[i])
				if (lastStartInner && lastEndOuter) {
					// 点1在被切割要素上，点2不在
					one = false
					avail = unionWith(avail, [coords[i]], isEqual)
					avails.push(avail)
					avail = []
					i--
				}
			} else {
				if (coords[i + 1]) {
					const line = new LineStringC([coords[i], coords[i + 1]])
					const points = CTool.getPolygonPolylineIntersectPoints(targetGeo, line)
					// 是否有相交点，有交点则进一步判断
					if (points.length > 0) {
						// 点1是否在被切割要素上
						const startOuter = !CTool.insidePolygon(CTool.getSafeCoords(targetGeo), coords[i]);
						// 点2是否在被切割要素上
						const endInner = CTool.insidePolygon(CTool.getSafeCoords(targetGeo), coords[i + 1])
						if (startOuter && endInner) {
							// 点1不在被切割要素上，点2在，属于相交
							one = true
							avail = unionWith(avail, [coords[i]], isEqual)
						} else {
							avails.push([coords[i], coords[i + 1]])
						}
					}
				}
			}
		}
		let lines = []
		avails.forEach((line) => lines.push(new LineStringC(line)))
		return lines
	}

}


export default PTool;