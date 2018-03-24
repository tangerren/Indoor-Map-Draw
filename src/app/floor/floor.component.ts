import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'floor',
  templateUrl: './floor.component.html',
  styleUrls: ['./floor.component.css']
})
export class FloorComponent implements OnInit {

  constructor() { }
  @Input() floors: number[];
  @Output() addFloor = new EventEmitter();

  ngOnInit() {
  }
  floorAdd(event) {
    event.stopPropagation();
    // 发送事件
    this.addFloor.emit();
  }
}
