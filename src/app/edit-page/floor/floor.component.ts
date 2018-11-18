import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-floor',
  templateUrl: './floor.component.html',
  styleUrls: ['./floor.component.css']
})
export class FloorComponent implements OnInit {
  mallID: string;

  constructor(private router: Router, private activeRoute: ActivatedRoute) { }

  ngOnInit() {
    // 接收路由参数
    this.activeRoute.queryParams.subscribe((params: Params) => {
      this.mallID = params['id'];
    });
    // TODO:查询该楼宇楼层信息
  }

  getMallInfo() {
    // 返回上一步，重新编辑楼与信息
    this.router.navigate(['edit/mall'], { queryParams: { id: this.mallID + 'floor-mall' } });
  }


  saveFloorInfo() {
    this.router.navigate(['edit/submit'], { queryParams: { id: this.mallID + 'floor-submit' } });
  }
}
