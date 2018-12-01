import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Mall } from '../types/Mall';

@Injectable({
  providedIn: 'root'
})

export class MallService {
  mallsUrl = "MockData/malls.json";
  mallUrl = "MockData/malls.json";

  constructor(private http: HttpClient) { }

  getMalls(): Observable<Mall[]> {
    return this.http.get<Mall[]>(this.mallsUrl);
  }

  getMallById(id: string): Observable<Mall[]> {
    // TODO: 修改真实返回类型为Observable<Mall>
    return this.http.get<Mall[]>(this.mallUrl + "?" + id);
  }

  saveBaseInfo(mall: Mall) {

  }
}
