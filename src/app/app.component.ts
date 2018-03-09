import { Component, ElementRef, OnInit } from '@angular/core';
import { Map, TileLayer, Marker } from 'leaflet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})



export class AppComponent  implements OnInit {

  constructor(protected elementRef: ElementRef) {

  }

  title = 'app';
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    this.createMap();
  }


  private createMap() {
    // tslint:disable-next-line:prefer-const
    let ele = this.elementRef.nativeElement.querySelector('#map');
    console.log(ele);
    // tslint:disable-next-line:prefer-const
    let map = new Map(ele).setView([51.505, -0.09], 13);

    new TileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    new Marker([51.5, -0.09]).addTo(map)
      .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
      .openPopup();
  }

}
