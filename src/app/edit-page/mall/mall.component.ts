import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MallService } from 'src/app/services/mall.service';
import { Mall } from 'src/app/types/Mall';

@Component({
  selector: 'app-mall',
  templateUrl: './mall.component.html',
  styleUrls: ['./mall.component.css']
})
export class MallComponent implements OnInit {
  mall: Mall = new Mall();
  id = this.mall.id;
  name = this.mall.name;
  address = this.mall.address;
  type = this.mall.type;
  floorNum = this.mall.floors;
  minFloor = this.mall.minFloor;
  isUnground = this.mall.isUnground;
  pName = this.mall.pName;
  pTel = this.mall.pTel;

  constructor(private router: Router, private mallService: MallService) { }

  ngOnInit() {
    this.mall.id = "mall-" + Math.random().toString(36).substr(2);
    this.mall.creator = "王二小";
    this.mall.date = new Date();
  }

  return() {
    this.router.navigate(['panel']);
  }

  save() {
    this.mallService.saveBaseInfo(this.mall);
  }

  next() {
    // 保存楼宇基本信息
    this.mallService.saveBaseInfo(this.mall);
    // 生成楼宇id
    this.router.navigate(['edit/floor'], { queryParams: { id: this.mall.id } });
  }
}
