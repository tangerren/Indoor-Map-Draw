import { Component, OnInit, Input } from '@angular/core';

import Map from 'ol/Map';
import Draw from 'ol/interaction/Draw';

@Component({
  selector: 'map-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  @Input() map: Map;
  polyLineDraw: Draw;


  constructor() { }

  ngOnInit() {
  }

}
