import { Component, OnInit, Input } from '@angular/core';

import Map from 'ol/Map';
import Polygon from 'ol/geom/Polygon';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import VerctorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Draw from 'ol/interaction/Draw';
import { createBox } from 'ol/interaction/Draw';
import Select from 'ol/interaction/Select';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';

@Component({
  selector: 'map-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  @Input() map: Map;
  private polyLineDraw: Draw;
  private polygonDraw: Draw;
  private polygonSelect: Select;
  private polygonModify: Modify;
  private snap: Snap;

  private vectorLayer: VectorLayer;
  private tempLayer: VectorLayer;
  private vectorSource = new VerctorSource();
  private tempSource = new VerctorSource();

  private style = new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new Stroke({
      color: '#ffcc33',
      width: 3,
      lineJoin: 'bevel',
      lineDash: [10, 10, 10],
      lineCap: 'square'
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: '#ffcc33'
      })
    })
  });

  constructor() { }

  ngOnInit() {
    // 创建绘图图层
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: this.style
    });
    this.map.addLayer(this.vectorLayer);

    // 创建绘图图层
    this.tempLayer = new VectorLayer({
      source: this.tempSource,
      style: this.style
    });
    this.map.addLayer(this.tempLayer);

    // 编辑交互
    this.polygonModify = new Modify({
      source: this.vectorSource
    });
    this.map.addInteraction(this.polygonModify);
    this.polygonModify.setActive(false);

    // 选中交互
    this.polygonSelect = new Select({
      multi: false,
      // TODO: 设置编辑、选中时候的样式
      // style: this.style
    });
    this.map.addInteraction(this.polygonSelect);
    this.polygonSelect.setActive(false);

    // 注册选中事件
    this.polygonSelect.on('select', (e) => {
      console.log(e);
    });
  }

  // 编辑属性
  editProp(event) {
    event.stopPropagation();
    this.clearInteraction();
    // TODO:设置编辑、选中时候的样式
    this.polygonSelect.setActive(true);
  }

  // 编辑节点
  editVector(event) {
    event.stopPropagation();
    this.clearInteraction();
    // TODO:设置编辑时候的样式
    this.polygonModify.setActive(true);
  }

  // 绘制多边形
  drawPolygon(event) {
    event.stopPropagation();
    this.clearInteraction();
    this.addInteractions('Polygon');
  }

  // 绘制矩形
  drawRec(event) {
    event.stopPropagation();
    this.clearInteraction();
    this.polygonDraw = new Draw({
      source: this.vectorSource,
      type: 'Circle',
      geometryFunction: createBox()
    });
    this.polygonDraw.on('drawend', (e: Draw.Event) => {
      console.log('drawed');
      console.log(this.vectorSource);
    });
    this.map.addInteraction(this.polygonDraw);
  }
  // 绘制圆
  drawCircle(event) {
    event.stopPropagation();
    this.clearInteraction();
    this.addInteractions('Circle');
  }
  // 切割多边形
  splitPolygon(event) {
    // 绘制线
    this.polyLineDraw = new Draw({
      source: this.tempSource,
      type: 'LineString'
    });
    this.polyLineDraw.on('drawend', (e: Draw.Event) => {
      console.log('splited');
    });
    this.map.addInteraction(this.polyLineDraw);
    this.polyLineDraw.setActive(false);
  }
  // 保存
  saveFloor(event) {

  }

  addInteractions(type) {
    this.polygonDraw = new Draw({
      source: this.vectorSource,
      type: type
    });
    this.polygonDraw.on('drawend', (e: Draw.Event) => {
      console.log('drawed');
      console.log(this.vectorSource);
    });
    this.map.addInteraction(this.polygonDraw);

    // 添加捕捉功能，必须要在Draw和Modi之后添加
    // The snap interaction must be added after the Modify and Draw interactions in order for its map browser event handlers to be fired first.
    // Its handlers are responsible of doing the snapping.
    this.snap = new Snap({ source: this.vectorSource });
    this.map.addInteraction(this.snap);
  }

  private clearInteraction() {
    this.map.removeInteraction(this.polygonDraw);
    this.map.removeInteraction(this.snap);
    this.polygonModify.setActive(false);
    this.polygonSelect.setActive(false);
    // this.polygonSelect.un('select', null);
  }
}
