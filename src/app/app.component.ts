import { Component, ElementRef, OnInit } from '@angular/core';

import { PanelComponent } from './panel/panel.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit {

  constructor(protected elementRef: ElementRef) {

  }

  ngOnInit() { }

}
