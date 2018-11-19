import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NgZorroAntdModule } from 'ng-zorro-antd';

import { MapComponent } from './map-page.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { FloorBarComponent } from './floor-bar/floor-bar.component';

const routes: Routes = [
	{
		path: '',
		component: MapComponent
	},
];

@NgModule({
	declarations: [
		MapComponent,
		ToolbarComponent,
		FloorBarComponent
	],
	imports: [
		CommonModule,
		NgZorroAntdModule,
		RouterModule.forChild(routes)
	],
	exports: [],
	providers: []
})
export class MapPageModule { }
