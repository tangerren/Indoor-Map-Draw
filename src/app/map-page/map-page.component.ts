import { Component, ElementRef, OnInit } from '@angular/core';

import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';

import VectorSource from 'ol/source/Vector';
import Static from 'ol/source/ImageStatic';
import OSM from 'ol/source/OSM';

import VectorLayer from 'ol/layer/Vector';
import ImageLayer from 'ol/layer/Image';
import TileLayer from 'ol/layer/Tile';


import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Icon from 'ol/style/Icon';

import { Polygon, fromExtent } from 'ol/geom/Polygon';
import * as proj from 'ol/proj';
import MousePosition from 'ol/control/MousePosition';

@Component({
  selector: 'app-map',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.css']
})
export class MapComponent implements OnInit {

  map: any;

  constructor(protected elementRef: ElementRef) { }

  ngOnInit() {
    this.createMap();
  }

  private createMap() {

    const imageStyle = new Style({
      stroke: new Stroke({
        color: 'blue',
        width: 3
      }),
      image: new Icon({
        src: 'https://woshisunwukong.github.io/image/indoor-map.jpg',
        crossOrigin: 'Anonymous',
        scale: 1,
        rotateWithView: true
      }),

    });
    const vecLayer = new VectorLayer({
      style: imageStyle,
      source: new VectorSource({
        features: [new Feature({
          geometry: fromExtent([11855662.310034806, 3452759.5557873524, 11855728.822132856, 3452823.3714489955])
        })]
      })
    });

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
          source: new OSM()
        })
      ],
      view: new View({
        center: proj.fromLonLat([106.50164388120174, 29.6043605183267]),
        zoom: 20
      }),
      controls: [new MousePosition({
        projection: 'EPSG:3857'
      })]
    });

    this.map.addLayer(vecLayer);
    this.map.addLayer(imageLayer);

  }
}
