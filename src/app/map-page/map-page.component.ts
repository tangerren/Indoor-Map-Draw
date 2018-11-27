import { Component, ElementRef, OnInit } from '@angular/core';

import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import { defaults as defaultControls, FullScreen } from 'ol/control.js';
import * as proj from 'ol/proj';

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

    const ele = this.elementRef.nativeElement.querySelector('#map');
    console.log(ele);
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM({ attributions: false }),
          zIndex: 1
        })
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
