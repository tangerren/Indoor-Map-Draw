import { Component, OnInit } from '@angular/core';

import { Mall } from '../types/Mall';
import { Router } from '@angular/router';

import { MallService } from '../services/mall.service';

@Component({
  selector: 'panel',
  templateUrl: './panel-page.component.html',
  styleUrls: ['./panel-page.component.css']
})

export class PanelPageComponent implements OnInit {
  malls: Mall[];
  constructor(private router: Router, private mallService: MallService) { }

  ngOnInit(): void {
    this.mallService.mallsUrl = "MockData/malls.json";
    this.mallService.getMalls().subscribe((data: Mall[]) => {
      this.malls = data;
    });
  }

  editMall(mall: Mall) {
    this.router.navigate(['edit'], { queryParams: { id: mall.id } });
  }
  editRoom(mall: Mall) {
    this.router.navigate(['map'], { queryParams: { id: mall.id } });
  }
  delMall() {
    this.router.navigate(['panel']);
  }
}
