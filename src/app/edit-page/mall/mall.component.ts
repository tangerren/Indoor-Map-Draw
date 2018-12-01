import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MallService } from 'src/app/services/mall.service';
import { Mall } from 'src/app/types/Mall';

@Component({
  selector: 'app-mall',
  templateUrl: './mall.component.html',
  styleUrls: ['./mall.component.css']
})
export class MallComponent implements OnInit {
  mall: Mall = new Mall();

  constructor(private router: Router, private activeRoute: ActivatedRoute, private mallService: MallService) { }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params: Params) => {
      if (params['id'] != null && params['id'] !== "") {
        this.mall.id = params['id'];
        this.mallService.getMallById(this.mall.id).subscribe(
          data => { this.mall = data[Math.floor(Math.random() * 10)]; }
        );
      } else {
        this.mall.id = "mall-" + Math.random().toString(36).substr(2);
        this.mall.creator = "王二小";
        this.mall.date = new Date();
      }
    });

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
