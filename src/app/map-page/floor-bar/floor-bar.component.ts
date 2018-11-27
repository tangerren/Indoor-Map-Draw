import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import Map from 'ol/Map';
import ImageLayer from 'ol/layer/Image';
import Static from 'ol/source/ImageStatic';

import { FloorService } from '../../services/floor.service';
import { Floor } from 'src/app/types/Floor';


@Component({
  selector: 'map-floor-bar',
  templateUrl: './floor-bar.component.html',
  styleUrls: ['./floor-bar.component.css']
})
export class FloorBarComponent implements OnInit {
  @Input() map: Map;
  @Input() imageLayer: ImageLayer;
  @Output() saveData = new EventEmitter<boolean>();
  @Output() setFloor = new EventEmitter<Floor>();

  selectedFloor: any;
  private floorList = [
    { index: 5, id: 5555555555 },
    { index: 4, id: 4444444444444 },
    { index: 3, id: 33333333333333 },
    { index: 2, id: 22222222222 },
    { index: 1, id: 111111111111 },
    { index: -1, id: '-1-1-1-1-1-1-1-' }
  ];

  constructor(private floorService: FloorService) { }
  ngOnInit() {
    this.onSelect(this.floorList[0]);
  }

  onSelect(floor) {
    this.selectedFloor = floor;
    this.loadImgByFloorId(floor.id);
    // 保存上次编辑的结果,清空图层
    this.saveData.emit(true);
    this.setFloor.emit(floor);
  }

  private loadImgByFloorId(id: string) {
    this.floorService.getImageById(id).subscribe(
      url => {
        this.imageLayer.setSource(new Static({
          imageExtent: [11855662.310034806, 3452759.5557873524, 11855728.822132856, 3452823.3714489955],
          url: url,
          projection: 'EPSG:3857'
        }));
      }
    );
  }
}
