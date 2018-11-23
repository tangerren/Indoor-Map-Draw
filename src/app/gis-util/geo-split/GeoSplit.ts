import Intersection from '../kld-intersections/Intersection';
import { isEqual } from 'lodash';
import PolygonC from './Polygon';
import LineStringC from './LineString';
import C_Tool from './C_Tool';
import P_Tool from './P_Tool';
import LTool from './L_Tool';
import { Polygon, LineString } from 'geojson';
import { copyStyles } from '@angular/animations/browser/src/util';

class GeoSplit {
	targetGeo: PolygonC | LineStringC;
	toolGeo: LineStringC;
	crossLinesP: LineStringC[];
	crossLinesL: LineStringC[];


	/**
	 * 使用一个GeoJSON对象分割另一个GeoJSON对象
	 * @param targetGeo 被分割的要素
	 * @param toolGeo 用来分割的要素
	 */
	constructor(targetGeo: PolygonC | LineStringC, toolGeo: LineStringC) {
		this.targetGeo = targetGeo;
		this.toolGeo = toolGeo;
	}

	/**
	 * 进行分割
	 */
	split(): Polygon[] | LineString[] {
		let result: any = this.splitWithTargets();
		return result;
	}


	//  Step 1
	splitWithTargets() {
		if (this.targetGeo.type === 'Polygon') {
			// 切割面
			return this.splitPolygonWithLine();
		} else if (this.targetGeo.type === 'LineString') {
			// 切割线
			return this.splitLineWithLine();
		} else {
			throw new Error('被切割的要素类型不受支持');
		}
	}

	/**
	 * 切割面
	 */
	splitPolygonWithLine() {
		let result;
		// 用于切割的要素与被切割要素的相交部分
		this.crossLinesP = P_Tool.getCrossLine(this.targetGeo as PolygonC, this.toolGeo);
		this.crossLinesP.forEach((crossLine) => {
			if (result) {
				// 如果有过个切割要素时，第二次循环会执行到这里
				let results = [];
				result.forEach((geo) => {
					this.targetGeo = geo;
					results.push(...this.splitPolygonTargetBase(crossLine));
				});
				result = results;
			} else {
				result = this.splitPolygonTargetBase(crossLine);
			}
		});
		return result;
	}

	/**
	 *  分割面，返回分割的结果
	 * @param  tool
	 */
	splitPolygonTargetBase(tool: any) {
		// 相交点
		const points = C_Tool.getPolygonPolylineIntersectPoints(this.targetGeo, tool);
		// 分割结果
		let result;
		if (points.length === 2) {
			// 2个相交点，分隔为2个
			result = this._splitWithTargetMoreTwo(tool);
		} else if (C_Tool.getSafeCoords(tool).length === 2 && points.length > 2) {
			// 多个相交点，分割为多个
			result = this._splitWithTargetCommon(tool);
		} else {
			// 没有相交点，无法分隔
			return [this.targetGeo];
		}
		return result;
	}

	/**
	 * 根据相交部分和被切割要素，得到切割结果
	 * @param   target
	 */
	_splitWithTargetCommon(target: any) {
		const coords0 = C_Tool.getSafeCoords(this.targetGeo);
		const polyline = C_Tool.getPoint2dFromCoords(target);
		let forward = true;
		let main = [];
		let child = [];
		let children = [];
		for (let i = 0; i < coords0.length - 1; i++) {
			const line = new LineStringC([coords0[i], coords0[i + 1]]);
			const polylineTmp = C_Tool.getPoint2dFromCoords(line);
			const {
				points
			} = Intersection.intersectPolylinePolyline(polyline, polylineTmp);
			const [ects] = C_Tool.getCoordsFromPoints(points);
			if (points.length > 0 || isEqual(coords0[i], ects)) {
				// points.length>0，才有必要进行equal判断
				if (forward) {
					main.push(coords0[i], ects);
					child.push(ects);
				} else {
					main.push(ects);
					child.push(coords0[i], ects);
					children.push(child);
					child = [];
				}
				forward = !forward;
			} else {
				if (forward) main.push(coords0[i]);
				else child.push(coords0[i]);
			}
		}
		let result = [];
		// 重复第一个点（首尾点要重复）
		main.push(main[0]);
		child.push(child[0]);
		let geo = new PolygonC([main]);
		result.push(geo);
		children.forEach((childCoord) => {
			geo = new PolygonC([childCoord]);
			result.push(geo);
		});
		return result;
	}

	_splitWithTargetMoreTwo(tool) {
		const coords0 = C_Tool.getSafeCoords(this.targetGeo); // 被分割要素坐标
		const polyline = C_Tool.getPoint2dFromCoords(tool); // 用于分隔的要素
		let forward = true;
		let main = [];
		let child = [];
		let gap = [];
		for (let i = 0; i < coords0.length - 1; i++) {
			const line = new LineStringC([coords0[i], coords0[i + 1]]);
			const polylineTmp = C_Tool.getPoint2dFromCoords(line);

			const {
				points // 切割要素 与 被切割要素第i条边的交点
			} = Intersection.intersectPolylinePolyline(polyline, polylineTmp);
			const ects = C_Tool.getCoordsFromPoints(points);
			const [ect] = ects; // 与被切割要素的第i条边的交点坐标
			// 被切割要素节点和交点一致或 者 有交点
			if (isEqual(coords0[i], ect) || points.length > 0) {
				if (forward) {
					main.push(coords0[i], ect);
				} else {
					main.push(ect, coords0[i + 1]);
				}
				if (gap.length === 0) {
					// 检测是否有内拐点
					gap = this._getTargetGap(tool, points[0]);
					if (gap.length > 0) {
						// 在面内有拐点
						main.push(...gap);
						child.push(...gap.reverse());
					}
				}
				if (forward) {
					child.push(ect);
				} else {
					child.push(coords0[i], ect);
				}
				// 与被切割要素的第i条边的交点个数大于1
				if (ects.length > 1) {
					main.push(ects[1]);
					child.push(ects[1]);
				} else {
					forward = !forward;
				}
			} else {
				if (forward) {
					main.push(coords0[i]);
				} else {
					child.push(coords0[i]);
				}
			}
		}
		let result = [];
		// 重复第一个点（首尾点要重复）
		main.push(main[0]);
		child.push(child[0]);
		let geo = new PolygonC([main]);
		result.push(geo);
		geo = new PolygonC([child]);
		result.push(geo);
		return result;
	}

	/**
	 * 用于切割的要素在被切割要素内的拐点
	 * @param {*} target 用于切割的要素
	 * @param {*} point0  交点
	 */
	_getTargetGap(target: any, point0: any) {
		const coords = C_Tool.getSafeCoords(target);
		let record = false;
		let index = [];
		let indexStart;
		for (let i = 0; i < coords.length - 1; i++) {
			if (record) {
				index.push(i);
			}
			const line = new LineStringC([coords[i], coords[i + 1]]); // 用于切割的线
			const points = C_Tool.getPolygonPolylineIntersectPoints(this.targetGeo, line); // 交点
			if (points.length > 0) {
				if (isEqual(points[0], point0)) {
					indexStart = i + 1;
				}
				record = !record;
			}
		}
		if (index[0] !== indexStart) index.reverse();
		let gap = [];
		index.forEach((i) => gap.push(coords[i]));
		return gap;
	}


	// 切割线
	splitLineWithLine() {
		this.crossLinesL = LTool.getCrossLine(this.targetGeo as LineStringC, this.toolGeo);
		let result;
		this.crossLinesL.forEach((crossLine) => {
			if (result) {
				let results = [];
				result.forEach((geo) => {
					this.targetGeo = geo;
					results.push(...this._splitLineTargetBase(crossLine));
				});
				result = results;
			} else {
				result = this._splitLineTargetBase(crossLine);
			}
		});
		return result;
	}

	_splitLineTargetBase(tool: LineStringC) {
		const polyline = C_Tool.getPoint2dFromCoords(tool);
		const coords = C_Tool.getSafeCoords(this.targetGeo);
		let lineCoord = [coords[0]];
		let lines = [];
		for (let i = 0; i < coords.length; i++) {
			if (coords[i + 1]) {
				const line = new LineStringC([coords[i], coords[i + 1]]);
				const polylineTmp = C_Tool.getPoint2dFromCoords(line);
				const {
					points
				} = Intersection.intersectPolylinePolyline(polyline, polylineTmp);
				if (points.length > 0) {
					const [ects] = C_Tool.getCoordsFromPoints(points);
					lineCoord.push(ects);
					lines.push(lineCoord);
					lineCoord = [ects, coords[i + 1]];
				} else lineCoord.push(coords[i + 1]);
			} else if (lineCoord.length > 0) {
				lineCoord.push(coords[i]);
				lines.push(lineCoord);
			}
		}
		let result = [];
		lines.forEach((line) => result.push(new LineStringC(line)));
		return result;
	}
}

export default GeoSplit;
