import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnInit {

  projs = [{
    name: "嘉华大厦",
    date: "2018-05-27",
    creator: "王丽",
    address: "博古街36号"
  }, {
    name: "嘉华大厦2",
    date: "2018-09-26",
    creator: "张柏",
    address: "博古街36号"
  }, {
    name: "嘉华大厦3",
    date: "2018-11-16",
    creator: "王小",
    address: "博古街36号"
  }];
  constructor() { }

  ngOnInit() {
  }

}
