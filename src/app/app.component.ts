import { Component, ElementRef, OnInit } from '@angular/core';
import { Map, TileLayer, Marker } from 'leaflet';

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

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    this.createMap();
  }


  private createMap() {
    // tslint:disable-next-line:prefer-const
    let ele = this.elementRef.nativeElement.querySelector('#map');
    console.log(ele);
    // tslint:disable-next-line:prefer-const
    this.map = new Map(ele).setView([51.505, -0.09], 13);

    new TileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    new Marker([51.5, -0.09]).addTo(this.map)
      .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
      .openPopup();
  }

}
