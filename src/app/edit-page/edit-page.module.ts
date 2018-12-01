import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { NgZorroAntdModule } from 'ng-zorro-antd';

import { EditPageComponent } from './edit-page.component';
import { MallComponent } from './mall/mall.component';
import { FloorComponent } from './floor/floor.component';
import { SubimitComponent } from './subimit/subimit.component';

import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		component: EditPageComponent,
		// 因为在app.mdule中已经loadchildren的时候指定了，所以这里写  ''
		children: [
			// 默认子路由为空的时候，选择mall
			{ path: '', component: MallComponent },
			{ path: 'mall', component: MallComponent },
			{ path: 'floor', component: FloorComponent },
			{ path: 'submit', component: SubimitComponent }
		]
	},
];


@NgModule({
	declarations: [
		EditPageComponent,
		MallComponent,
		FloorComponent,
		SubimitComponent
	],
	imports: [
		CommonModule, FormsModule,
		ReactiveFormsModule,
		NgZorroAntdModule,
		RouterModule.forChild(routes)
	],
	exports: [],
	providers: []
})
export class EditPageModule { }
