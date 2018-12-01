import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { Floor } from '../types/Floor';

@Injectable({
	providedIn: 'root'
})

export class FloorService {
	iamgeUrl: string;

	constructor(private http: HttpClient) { }

	getFloors(): Observable<Floor[]> {
		return this.http.get<Floor[]>(this.iamgeUrl);
	}

	getImageById(id: string): Observable<string> {
		// TODO: 根据di查询图片地址
		// return this.http.get<string>(this.iamgeUrl);

		// 模拟
		let result = 'http://localhost/jpgs/' + Math.floor(Math.random() * 10) + '.jpg';
		let a: Observable<string>;
		a = Observable.create((observer) => {
			setTimeout(() => {
				observer.next(result);
				observer.complete();
			}, 100);
		});
		return a;
	}

	saveToDb(floorId: string, geo: string) {
		// TODO: 調用接口，保存到數據庫
		console.log("保存到数据库：【" + floorId + '】' + geo);
	}
}
