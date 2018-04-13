import {
    helpers, lineSplit, getCoords, featureEach,
} from '@turf/turf';

import { Feature, Polygon, LineString, lineString, featureCollection, FeatureCollection, feature, Geometry } from '@turf/helpers';

/**
 * var polygon = {
 *   "geometry": {
 *     "type": "Polygon",
 *     "coordinates": [[
 *         [0, 0],
 *         [0, 10],
 *         [10, 10],
 *         [10, 0],
 *         [0, 0]
 *     ]]
 *   }
 * };
 * var linestring =  {
 *     "type": "Feature",
 *     "properties": {},
 *     "geometry": {
 *       "type": "LineString",
 *       "coordinates": [
 *         [5, 15],
 *         [5, -15]
 *       ]
 *     }
 *   }
 * var sliced = turf.polygonSlice(polygon, linestring);
*/
export class PolygonSlice {

    slice(poly: Feature<Polygon>, splitter: Feature<LineString>): FeatureCollection<LineString> {
        let results = [];
        let coords = getCoords(poly);
        let outer = lineString(coords[0]);
        let inners = this.innerLineStrings(poly);

        // Split outers
        featureEach(lineSplit(outer, splitter), function (line) {
            results.push(line);
        });

        // Split inners
        featureEach(inners, function (inner) {
            featureEach(lineSplit(inner, splitter), function (line) {
                results.push(line);
            });
        });

        // Split splitter
        featureEach(lineSplit(splitter, poly), function (line) {
            results.push(line);
        });

        return featureCollection(results);
    }

    // feature to featureCollection
    innerLineStrings(poly): FeatureCollection<LineString> {
        let results = [];
        let coords = getCoords(poly);
        coords.slice(1, coords.length).forEach(coord =>
            results.push(lineString(coord))
        );
        return featureCollection(results);
    }
}

