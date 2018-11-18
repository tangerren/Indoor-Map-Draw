import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import zh from '@angular/common/locales/zh';


import { AppComponent } from './app.component';
import { PanelPageComponent } from './panel-page/pane-page.component';
import { MapComponent } from './map-page/map-page.component';

import { LoginComponent } from './login-page/login-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { SaveToDbService } from './services/saveToDb.service';

import { AppRoutes } from './app.route';

registerLocaleData(zh);

@NgModule({
	declarations: [
		AppComponent,
		PanelPageComponent,
		MapComponent,
		LoginComponent,
		PageNotFoundComponent
	],
	imports: [
		BrowserModule, FormsModule, BrowserAnimationsModule, HttpClientModule, ReactiveFormsModule,
		/** 导入 ng-zorro-antd 模块 **/
		NgZorroAntdModule,
		// 自定义模块
		// 路由模块
		AppRoutes
	],
	providers: [SaveToDbService, { provide: NZ_I18N, useValue: zh_CN }, { provide: LocationStrategy, useClass: HashLocationStrategy }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
