import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { DrawToolComponent } from './draw-tool/draw-tool.component';
import { SaveToDbService } from './services/saveToDb.service';
import { FloorComponent } from './floor/floor.component';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { RoomPropertiesComponent } from './room-properties/room-properties.component';
import { PanelComponent } from './panel/panel.component';
import { MapComponent } from './map/map.component';


@NgModule({
  declarations: [
    AppComponent,
    DrawToolComponent,
    FloorComponent,
    ModalDialogComponent,
    RoomPropertiesComponent,
    PanelComponent,
    MapComponent
  ],
  imports: [
    BrowserModule, FormsModule
  ],
  providers: [SaveToDbService],
  bootstrap: [AppComponent]
})
export class AppModule { }
