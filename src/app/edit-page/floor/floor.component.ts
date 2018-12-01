import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { Floor } from 'src/app/types/Floor';
import { FloorService } from 'src/app/services/floor.service';

@Component({
  selector: 'app-floor',
  templateUrl: './floor.component.html',
  styleUrls: ['./floor.component.css']
})
export class FloorComponent implements OnInit {
  mallId: string;
  floors: Floor[];

  avatarUrl: string[] = ["", "", "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAA"];
  constructor(private router: Router, private activeRoute: ActivatedRoute, private floorService: FloorService) { }

  ngOnInit() {
    // 接收路由参数
    this.activeRoute.queryParams.subscribe((params: Params) => {
      this.mallId = params['id'];
      this.floorService.getFloors(this.mallId).subscribe(data => this.floors = data);
    });
  }

  private getBase64(img: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result.toString()));
    reader.readAsDataURL(img);
  }

  handleChange(info: { file: UploadFile }, i: number): void {
    if (info.file.status === 'done') {
      this.getBase64(info.file.originFileObj, (img: string) => {
        this.avatarUrl[i] = img;
      });
    }
    if (info.file.status === 'error') {
      console.log("上传出错：" + this.floors[i]);
    }
  }

  getMallInfo() {
    // 返回上一步，重新编辑楼与信息
    this.router.navigate(['edit/mall'], { queryParams: { id: this.mallId } });
  }


  saveFloorInfo() {
    this.router.navigate(['edit/submit'], { queryParams: { id: this.mallId } });
  }
}
