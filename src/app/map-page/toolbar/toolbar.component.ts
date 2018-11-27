import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import Map from 'ol/Map';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import VerctorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Draw from 'ol/interaction/Draw';
import { createBox, createRegularPolygon } from 'ol/interaction/Draw';
import Select from 'ol/interaction/Select';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';

import GeoSplit from '../../gis-util/index';
@Component({
	selector: 'map-toolbar',
	templateUrl: './toolbar.component.html',
	styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

	@Output() saveData = new EventEmitter<boolean>();
	@Input() map: Map;
	@Input() pLayer: VectorLayer;
	@Input() sLayer: VectorLayer;

	private pLayerSource = new VerctorSource();
	private sLayerSource = new VerctorSource();

	private polygonDraw: Draw;
	private polyLineDraw: Draw;
	private polygonSelect: Select;
	private polygonModify: Modify;
	private snap: Snap;

	private fillStyle = new Fill({
		color: 'rgba(255, 255, 255, 0.2)'
	});
	private strokeStyle = new Stroke({
		color: '#ffcc33',
		width: 3,
		lineJoin: 'bevel',
		lineCap: 'square'
	});
	private strokeStyle_d = this.strokeStyle.clone();
	private strokeStyle_e = this.strokeStyle.clone();
	private strokeStyle_s = this.strokeStyle.clone();

	private imageStyle = new CircleStyle({
		radius: 7,
		fill: new Fill({
			color: '#FF0000'
		})
	});


	constructor() { }

	ngOnInit() {
		this.strokeStyle_e.setLineDash([10, 10, 10]);
		this.strokeStyle_s.setColor('#FF0000');

		// 创建绘图图层
		this.pLayer.setSource(this.pLayerSource);
		this.pLayer.setStyle(new Style({
			fill: this.fillStyle,
			stroke: this.strokeStyle_d,
			image: this.imageStyle
		}));

		// 创建绘图图层
		this.sLayer.setSource(this.sLayerSource);
		this.sLayer.setStyle(new Style({
			fill: this.fillStyle,
			stroke: this.strokeStyle_s,
			image: this.imageStyle
		}));
	}

	// 编辑属性
	editProp(event) {
		event.stopPropagation();
		this.clearInteraction();
		this.addSelectInteractions('editProp');
	}

	// 编辑节点
	editVector(event) {
		event.stopPropagation();
		this.clearInteraction();
		this.pLayer.getStyle().setStroke(this.strokeStyle_e);
		this.pLayer.changed();
		// 编辑交互
		this.polygonModify = new Modify({
			source: this.pLayerSource
		});
		this.map.addInteraction(this.polygonModify);
	}

	// 绘制多边形
	drawPolygon(event) {
		event.stopPropagation();
		this.clearInteraction();
		this.addDrawInteractions('Polygon');
	}

	// 绘制矩形
	drawRec(event) {
		event.stopPropagation();
		this.clearInteraction();
		this.addDrawInteractions('Circle', createBox());
	}
	// 绘制圆
	drawCircle(event) {
		event.stopPropagation();
		this.clearInteraction();
		this.addDrawInteractions('Circle', createRegularPolygon(0));
	}
	// 切割多边形
	splitPolygon(event) {
		event.stopPropagation();
		this.clearInteraction();
		this.addSelectInteractions('splitPolygon');
	}

	delPolygon(event) {
		event.stopPropagation();
		this.addSelectInteractions('delPolygon');
	}

	// 保存
	saveFloor(event) {
		event.stopPropagation();
		this.clearInteraction();
		// 保存编辑的结果
		this.saveData.emit();
	}

	// 移除交互
	private clearInteraction() {
		this.map.removeInteraction(this.polygonDraw);

		this.map.removeInteraction(this.polyLineDraw);
		this.polyLineDraw = null;

		this.map.removeInteraction(this.snap);
		this.map.removeInteraction(this.polygonSelect);
		this.map.removeInteraction(this.polygonModify);

		this.pLayer.getStyle().setStroke(this.strokeStyle);
		this.pLayer.changed();

		if (this.polygonSelect) {
			this.polygonSelect.getFeatures().clear();
		}
	}

	// 添加绘制多边形交互
	addDrawInteractions(type: string, geoFun?) {
		this.polygonDraw = new Draw({
			source: this.pLayerSource,
			type: type,
			geometryFunction: geoFun
		});
		this.polygonDraw.on('drawend', (e: Draw.Event) => {
			console.log('drawed' + this.pLayerSource);
		});
		this.map.addInteraction(this.polygonDraw);

		// 添加捕捉功能，必须要在Draw和Modi之后添加
		// The snap interaction must be added after the Modify and Draw interactions in order for its map browser event handlers to be fired first.
		// Its handlers are responsible of doing the snapping.
		this.snap = new Snap({ source: this.pLayerSource });
		this.map.addInteraction(this.snap);
	}

	// 添加选中交互
	addSelectInteractions(type: string) {
		this.polygonSelect = new Select({
			multi: false,
		});
		this.map.addInteraction(this.polygonSelect);
		// 注册选中事件
		this.polygonSelect.on('select', (e) => {
			if (e.selected.length === 1) {
				if (type === 'editProp') {
					// TODO:弹出悬浮窗，编辑房间属性
					console.log('弹出悬浮窗：' + e);
				} else if (type === 'splitPolygon' && !this.polyLineDraw) {
					this.drawLineToSpilt();
					console.log('开始绘制线' + e);
				} else if (type === "delPolygon") {
					this.pLayerSource.removeFeature(e.selected[0]);
					this.polygonSelect.getFeatures().clear();
				}
			}
		});
	}

	// 绘制切割线
	drawLineToSpilt() {
		this.polyLineDraw = new Draw({
			source: this.sLayerSource,
			type: 'LineString',
			stopClick: true, // 为true时双击结束绘制，不会放大地图
			style: new Style({ stroke: this.strokeStyle_s })
		});
		let sp = this.polygonSelect.getFeatures().item(0);
		this.polyLineDraw.once('drawend', (e: Draw.Event) => {
			this.split(sp, e.feature).then((result) => {
				let geo = new GeoJSON();
				let splitResult = geo.readFeatures(result);
				this.pLayerSource.removeFeature(sp);
				this.pLayerSource.addFeatures(splitResult);
				// 要放到异步函数中去清空绘制的图层，因为在DRAWEND的时候，绘制的内容还未放到source中
				this.sLayerSource.clear();
				this.polygonSelect.getFeatures().clear();
			}).catch(reason => {
				this.polygonSelect.getFeatures().clear();
				this.sLayerSource.clear();
				alert("请绘制能够分隔一个面的线");
				console.log('切割错误：' + reason);
			});

			this.map.removeInteraction(this.polyLineDraw);
			this.polyLineDraw = null;
		});
		this.map.addInteraction(this.polyLineDraw);
	}

	// geoTool 切割geojson
	split(sp, sl) {
		console.log('splited');
		return new Promise((resolve, reject) => {
			let geo = new GeoJSON();
			let sP = JSON.parse(geo.writeFeature(sp)).geometry;
			let sL = JSON.parse(geo.writeFeature(sl)).geometry;
			let split = new GeoSplit(sP, sL);
			let geos: any = split.split();

			// 组合成geojson格式  FeatureCollection
			let ps = [];
			// tslint:disable-next-line:no-shadowed-variable
			geos.forEach((geo: any) => {
				ps.push({
					"type": "Feature",
					"properties": {},
					"geometry": geo
				});
			});
			// console.log(JSON.stringify(ps));
			if (ps) {
				resolve({
					"type": "FeatureCollection",
					"features": ps
				});
			} else {
				reject('切割没有生成结果');
			}
		});
	}
}
