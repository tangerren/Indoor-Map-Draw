import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { DrawToolComponent } from './draw-tool/draw-tool.component';
import { SaveToDbService } from './services/saveToDb.service';
import { FloorComponent } from './floor/floor.component';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { PropertiesComponent } from './properties/properties.component';


@NgModule({
  declarations: [
    AppComponent,
    DrawToolComponent,
    FloorComponent,
    ModalDialogComponent,
    PropertiesComponent
  ],
  imports: [
    BrowserModule, FormsModule
  ],
  providers: [SaveToDbService],
  bootstrap: [AppComponent]
})
export class AppModule { }
