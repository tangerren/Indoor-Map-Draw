import { Component, ElementRef, OnInit } from '@angular/core';

import Map from 'ol/Map';
import View from 'ol/View';
import Static from 'ol/source/ImageStatic';
import OSM from 'ol/source/OSM';
import ImageLayer from 'ol/layer/Image';
import TileLayer from 'ol/layer/Tile';
import { defaults as defaultControls, FullScreen } from 'ol/control.js';
import * as proj from 'ol/proj';

import ToolbarComponent from './toolbar/toolbar.component';

@Component({
  selector: 'app-map',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.css']
})
export class MapComponent implements OnInit {

  map: Map;

  constructor(protected elementRef: ElementRef) { }

  ngOnInit() {
    this.createMap();
  }

  private createMap() {
    const imageLayer = new ImageLayer({
      source: new Static({
        url: 'https://woshisunwukong.github.io/image/indoor-map.jpg',
        imageExtent: [11855662.310034806, 3452759.5557873524, 11855728.822132856, 3452823.3714489955],
        projection: 'EPSG:3857'
      })
    });


    const ele = this.elementRef.nativeElement.querySelector('#map');
    console.log(ele);
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM({ attributions: false })
        }),
        imageLayer
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
}
