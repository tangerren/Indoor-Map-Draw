import GeoSplit from './geo-split/GeoSplit';

/**
 * demo
	import Polygon_C from './geo-split/Polygon';
	import LineString_C from './geo-split/LineString';

	import P from './testP';
	import L from './testL';

	let p = new Polygon_C([P]);
	let l = new LineString_C(L);
	let split = new GeoSplit(p, l);
	console.log(new Date().getTime());
	let geos: any = split.split();
	console.log(new Date().getTime());




	// 组合成geojson格式  FeatureCollection
	let ps = [];
	geos.forEach((geo) => {
		ps.push({
			"type": "Feature",
			"properties": {},
			"geometry": geo
		});
	});
	console.log(JSON.stringify(ps));
 */

export default GeoSplit;
