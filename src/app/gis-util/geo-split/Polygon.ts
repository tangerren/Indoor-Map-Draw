import { BBox, Polygon, Position } from 'geojson';

class PolygonC implements Polygon {
	bbox?: BBox;
	type: Polygon["type"] = "Polygon";
	coordinates: Position[][];
	constructor(coordinates: Position[][]) {
		this.coordinates = coordinates;
	}
}
export default PolygonC;
