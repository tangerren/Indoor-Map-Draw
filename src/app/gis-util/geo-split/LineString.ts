import { LineString, BBox, Position } from 'geojson';
class LineStringC implements LineString {
	bbox?: BBox;
	type: LineString["type"] = "LineString";
	coordinates: Position[];
	constructor(coordinates: Position[]) {
		this.coordinates = coordinates;
	}
}
export default LineStringC;
