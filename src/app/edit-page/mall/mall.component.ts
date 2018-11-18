import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mall',
  templateUrl: './mall.component.html',
  styleUrls: ['./mall.component.css']
})
export class MallComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  saveMallInfo() {
    // 保存楼宇基本信息
    // 生成楼宇id
    this.router.navigate(['edit/floor'], { queryParams: { id: '2e32dsfdaf-mall-floor' } });
  }
}
