
import LineStringC from './LineString';
import C_Tool from './C_Tool';
import { Position } from 'geojson';

class LTool {


	static getCrossLine(targetGeo: LineStringC, toolGeo: LineStringC): LineStringC[] {
		let lines = [];
		const coords = C_Tool.getSafeCoords(toolGeo) as Position[];
		for (let i = 0; i < coords.length - 1; i++) {
			const line = new LineStringC([coords[i], coords[i + 1]]);
			const points = C_Tool.getPolygonPolylineIntersectPoints(targetGeo, line);
			if (points.length > 0) {
				lines.push(line);
			}
		}
		return lines;
	}

}

export default LTool;
