import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})


export class AppComponent implements OnInit {

  isCollapsed = false;
  triggerTemplate = null;

  currentModule = "楼宇管理";
  mallName = "";

  @ViewChild('trigger') customTrigger: TemplateRef<void>;
  constructor(private router: Router) { }

  ngOnInit() { }

  // 新建楼宇
  newMall() {
    this.currentModule = "楼宇管理";
    this.mallName = '新建楼宇';
    this.router.navigate(['edit'], { queryParams: { id: '' } });
  }

  // 楼宇列表
  allMall() {
    this.currentModule = "楼宇管理";
    this.mallName = '楼宇列表';
    this.router.navigate(['panel']);
  }

  // 我的收藏
  favMall() {
    this.currentModule = "楼宇管理";
    this.mallName = '我的收藏';
    this.router.navigate(['panel']);
  }


  // 切换菜单
  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

}
