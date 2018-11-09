import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { DrawToolComponent } from './draw-tool/draw-tool.component';
import { SaveToDbService } from './services/saveToDb.service';
import { FloorComponent } from './floor/floor.component';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { RoomPropertiesComponent } from './room-properties/room-properties.component';
import { PanelPageComponent } from './panel-page/pane-page.component';
import { MapComponent } from './map/map.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { ProjectModalComponent } from './project-modal/project-modal.component';
import { EditPageComponent } from './edit-page/edit-page.component';

registerLocaleData(zh);


@NgModule({
  declarations: [
    AppComponent,
    DrawToolComponent,
    FloorComponent,
    ModalDialogComponent,
    RoomPropertiesComponent,
    PanelPageComponent,
    MapComponent,
    ProjectModalComponent,
    EditPageComponent
  ],
  imports: [
    BrowserModule, FormsModule, BrowserAnimationsModule, HttpClientModule, ReactiveFormsModule,
    /** 导入 ng-zorro-antd 模块 **/
    NgZorroAntdModule
  ],
  providers: [SaveToDbService, { provide: NZ_I18N, useValue: zh_CN }],
  bootstrap: [AppComponent]
})
export class AppModule { }
