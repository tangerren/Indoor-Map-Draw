import { Component, OnInit, Input } from '@angular/core';

import Map from 'ol/Map';
import Static from 'ol/source/ImageStatic';
import ImageLayer from 'ol/layer/Image';

import { FloorService } from '../../services/floor.service';


@Component({
  selector: 'map-floor-bar',
  templateUrl: './floor-bar.component.html',
  styleUrls: ['./floor-bar.component.css']
})
export class FloorBarComponent implements OnInit {
  @Input() map: Map;
  selectedFloor: any;
  private floorList = [
    { index: 5, id: '' },
    { index: 4, id: '' },
    { index: 3, id: '' },
    { index: 2, id: '' },
    { index: 1, id: '' },
    { index: -1, id: '' }
  ];
  imageLayer: ImageLayer;

  constructor(private floorService: FloorService) { }
  ngOnInit() {
    this.selectedFloor = this.floorList[0];
    this.loadImgByFloorId(this.selectedFloor.id);
  }


  onSelect(floor) {
    this.selectedFloor = floor;
    this.loadImgByFloorId(floor.id);
    // TODO:保存上次编辑的结果
    // TODO:保存上次编辑的结果
  }

  loadImgByFloorId(id: string) {
    this.map.removeLayer(this.imageLayer);

    this.floorService.getImageById(id).subscribe(
      url => {
        this.imageLayer = new ImageLayer({
          source: new Static({
            imageExtent: [11855662.310034806, 3452759.5557873524, 11855728.822132856, 3452823.3714489955],
            url: url,
            projection: 'EPSG:3857'
          }),
          zIndex: 1
        });
        this.map.addLayer(this.imageLayer);
      }
    );
  }
}
