import { Component, OnInit, Input } from '@angular/core';

import { FeatureGroup, Control } from 'leaflet';

import 'leaflet-draw';

@Component({
    selector: 'draw-tool',
    templateUrl: './draw-tool.component.html',
    styleUrls: ['./draw-tool.component.css']
})
export class DrawToolComponent implements OnInit {

    @Input() map: any;
    drawnItems: FeatureGroup;
    constructor() { }

    ngOnInit() {
        this.drawnItems = new FeatureGroup();
        this.map.addLayer(this.drawnItems);
        this.map.addControl(new Control.Draw({
            edit: {
                featureGroup: this.drawnItems
            }
        }));
        this.map.on('draw:created', (event) => {
            this.drawnItems.addLayer(event.layer);
        });
    }

    log() {
        console.log(this.map);
    }
}
