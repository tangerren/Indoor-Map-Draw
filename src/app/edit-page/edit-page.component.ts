import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.css']
})
export class EditPageComponent implements OnInit {
  current = 0;

  constructor(private router: Router) { }

  ngOnInit() {
    this.matchSetp(this.router.url);
    this.router.events.subscribe((e: NavigationEnd) => {
      if (e instanceof NavigationEnd) {
        this.matchSetp(e.url);
      }
    });
    // TODO: 计算容器高度
  }

  matchSetp(url) {
    if (url.indexOf('/edit/mall') !== -1) {
      this.current = 0;
    } else if (url.indexOf('/edit/floor') !== -1) {
      this.current = 1;
    } else if (url.indexOf('/edit/submit') !== -1) {
      this.current = 2;
    }
  }
}
