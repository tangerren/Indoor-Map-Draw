import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Mall } from '../types/Mall';

@Injectable({
  providedIn: 'root'
})

export class MallService {
  heroesUrl: string;

  constructor(private http: HttpClient) { }

  getMalls(): Observable<Mall[]> {
    return this.http.get<Mall[]>(this.heroesUrl);
  }

}
