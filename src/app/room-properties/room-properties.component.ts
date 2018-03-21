import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'room-properties',
  templateUrl: './room-properties.component.html',
  styleUrls: ['./room-properties.component.css']
})
export class RoomPropertiesComponent implements OnInit {


  constructor() { }

  @Input() properties = {
    id: '3sds4sfpcjtbslf8bmhiebhri4', // 唯一标识
    name: '', // 名称
    floor: 2, // 所在楼层
    type: 'sm', // 房间类型
    pName: '张无忌', // 联系人姓名
    pTel: '15333333333' // 联系人电话
  };

  ngOnInit() {
  }

  validate(): string {
    let errInfo: string;
    errInfo = '';
    return errInfo;
  }

  saveInfo(): any {
    console.log(this.properties);
  }
}
