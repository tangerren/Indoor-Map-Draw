import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { DrawToolComponent } from './draw-tool/draw-tool.component';
import { GeojsonService } from './services/geojson.service';


@NgModule({
  declarations: [
    AppComponent,
    DrawToolComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [GeojsonService],
  bootstrap: [AppComponent]
})
export class AppModule { }
