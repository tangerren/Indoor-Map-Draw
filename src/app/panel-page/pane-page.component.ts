import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';

import { MallProp } from '../types/MallProp';

@Component({
  selector: 'panel',
  templateUrl: './panel-page.component.html',
  styleUrls: ['./panel-page.component.css']
})
export class PanelPageComponent implements OnInit {
  newproj: MallProp = {
    id: "",
    name: "",
    date: "",
    creator: "",
    address: "",
    pName: "",
    pTel: ""
  };

  projs: MallProp[] = [{
    name: "嘉华大厦",
    date: "2018-05-27",
    creator: "王丽",
    address: "博古街36号",
    id: "",
    startFloor: 0,
    endFloor: 0,
    floors: 0,
    pName: "王丽",
    pTel: "15320283736"
  }, {
    name: "嘉华大厦2",
    date: "2018-09-26",
    creator: "张柏",
    address: "博古街36号",
    id: "",
    startFloor: 0,
    endFloor: 0,
    floors: 0,
    pName: "张柏",
    pTel: "13623428767"
  }, {
    name: "嘉华大厦3",
    date: "2018-11-16",
    creator: "王小",
    address: "博古街36号",
    id: "",
    startFloor: 0,
    endFloor: 0,
    floors: 0,
    pName: "王小",
    pTel: "15822328878"
  }];

  isCollapsed = false;
  triggerTemplate = null;
  @ViewChild('trigger') customTrigger: TemplateRef<void>;
  constructor() { }

  ngOnInit() { }

  /** custom trigger can be TemplateRef **/
  changeTrigger(): void {
    this.triggerTemplate = this.customTrigger;
  }
}
