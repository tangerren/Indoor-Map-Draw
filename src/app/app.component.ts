import { Component, ElementRef, OnInit } from '@angular/core';


@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})


export class AppComponent implements OnInit {

  constructor(protected elementRef: ElementRef) {

  }

  ngOnInit() { }

}
