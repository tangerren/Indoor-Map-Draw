import { Component, ElementRef, OnInit } from '@angular/core';

import { Map, View, layer, source, proj, style, Feature, geom, control } from 'openlayers';

import { DrawToolComponent } from './draw-tool/draw-tool.component';

import { PolygonSlice } from '../utils/split-polygon';
import { polygon, lineString, lineToPolygon } from '@turf/turf';

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
    this.testSplitPolygon();
  }


  testSplitPolygon() {
    let mian = polygon([[
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0],
      [0, 0]
    ]]);
    let xian = lineString([
      [5, 15],
      [5, -15]
    ]);
    let sP = new PolygonSlice();
    let splied = sP.slice(mian, xian);

    for (let i = 0; i < splied.features.length; i++) {
      const element = splied.features[i];
      if (element.geometry.coordinates.length >= 3) {
        console.log(lineToPolygon(element));
      }
    }
  }


  private createMap() {

    const imageStyle = new style.Style({
      stroke: new style.Stroke({
        color: 'blue',
        width: 3
      }),
      image: new style.Icon({
        src: 'https://woshisunwukong.github.io/image/indoor-map.jpg',
        crossOrigin: 'Anonymous',
        scale: 1,
        rotateWithView: true
      }),

    });
    const vecLayer = new layer.Vector({
      style: imageStyle,
      source: new source.Vector({
        features: [new Feature({
          geometry: geom.Polygon.fromExtent([11855662.310034806, 3452759.5557873524, 11855728.822132856, 3452823.3714489955])
        })]
      })
    });

    const imageLayer = new layer.Image({
      source: new source.ImageStatic({
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
        new layer.Tile({
          source: new source.OSM()
        })
      ],
      view: new View({
        center: proj.fromLonLat([106.50164388120174, 29.6043605183267]),
        zoom: 20
      }),
      controls: [new control.MousePosition({
        className: 'position-lable',
        projection: 'EPSG:3857'
      })]
    });

    this.map.addLayer(vecLayer);
    this.map.addLayer(imageLayer);

  }
}
