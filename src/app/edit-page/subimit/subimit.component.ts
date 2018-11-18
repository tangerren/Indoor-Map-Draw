import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-subimit',
  templateUrl: './subimit.component.html',
  styleUrls: ['./subimit.component.css']
})
export class SubimitComponent implements OnInit {
  mallID: any;

  constructor(private router: Router, private activeRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params: Params) => {
      this.mallID = params['id'];
    });
    // TODO:查询该所有楼层信息
  }

  getFloorInfo() {
    // 返回上一步，重新编辑楼与信息
    this.router.navigate(['edit/floor'], { queryParams: { id: this.mallID + 'submit-floor' } });
  }


  finish() {
    this.router.navigate(['map'], { queryParams: { id: this.mallID + 'mallSubmit→' } });
  }
}
