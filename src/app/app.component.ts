import { Component, ElementRef, OnInit } from '@angular/core';

import { Map, View, layer, source, proj } from 'openlayers';

import { DrawToolComponent } from './draw-tool/draw-tool.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit {

  map: any;
  constructor(protected elementRef: ElementRef) {

  }

  ngOnInit() {
    this.createMap();
  }


  private createMap() {
    const ele = this.elementRef.nativeElement.querySelector('#map');
    console.log(ele);
    this.map = new Map({
      target: 'map',
      layers: [
        new layer.Tile({
          source: new source.OSM()
        })
      ],
      view: new View({
        center: proj.fromLonLat([105.41, 29.82]),
        zoom: 4
      })
    });
  }
}
