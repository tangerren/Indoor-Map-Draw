import { Component, ElementRef, OnInit } from '@angular/core';

import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import ImageLayer from 'ol/layer/Image';
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/Tile';
import GeoJSON from 'ol/format/GeoJSON';
import { defaults as defaultControls, FullScreen } from 'ol/control.js';
import * as proj from 'ol/proj';
import { Floor } from '../types/Floor';

@Component({
  selector: 'app-map',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.css']
})
export class MapComponent implements OnInit {

  private map: Map;
  // 创建底图图层
  private imageLayer = new ImageLayer({ zIndex: 1 });
  // 创建绘图图层
  private pLayer = new VectorLayer({ zIndex: 2 });
  // 创建绘图图层
  private sLayer = new VectorLayer({ zIndex: 3 });
  currentFloor: string;

  constructor(protected elementRef: ElementRef) { }

  ngOnInit() {
    this.createMap();
  }

  private createMap() {
    const ele = this.elementRef.nativeElement.querySelector('#map');
    console.log(ele);
    /**
     * 图层顺序：
     * OSM地图--》影像地图--》工作面图层--》切割线图层
     */
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM({ attributions: false }),
          zIndex: 0
        }),
        this.imageLayer,
        this.pLayer,
        this.sLayer
      ],
      view: new View({
        center: proj.fromLonLat([106.50164388120174, 29.6043605183267]),
        zoom: 20
      }),
      controls: defaultControls().extend([
        new FullScreen()
      ]),
    });
  }

  setFloor(floor: Floor) {
    this.currentFloor = floor.id;
  }

  // 保存当前图层的数据
  saveData(isClear: boolean) {
    let pSource = this.pLayer.getSource();
    let fs = pSource.getFeatures();
    if (fs.length === 0) {
      return;
    }
    let geo = new GeoJSON();
    let s = geo.writeFeatures(fs);
    // TODO: 请求接口保存到数据库(根据对应的floorId  this.currentFloor )
    console.log("保存到数据库：【" + this.currentFloor + '】' + s);
    if (isClear) {
      pSource.clear();
    }
  }
}
