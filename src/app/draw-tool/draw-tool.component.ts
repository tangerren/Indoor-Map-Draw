import { Component, OnInit, Input } from '@angular/core';

import { FeatureGroup, Control, Draw, DrawOptions } from 'leaflet';

import 'leaflet-draw';

@Component({
    selector: 'draw-tool',
    templateUrl: './draw-tool.component.html',
    styleUrls: ['./draw-tool.component.css']
})
export class DrawToolComponent implements OnInit {

    @Input() map: any;
    drawnItems: FeatureGroup[] = [];
    constructor() { }

    ngOnInit() {

    }

    /**
     * 每层楼一个FeatureGroup
     */
    creat(type) {
        const floorIndex = this.drawnItems.length;
        if (floorIndex === 0 && type === 'floor') {
            console.log('请先创建Mall！');
            return;
        }
        this.drawnItems[floorIndex] = new FeatureGroup();
        this.map.addLayer(this.drawnItems[floorIndex]);
        // 清除前几个图层绑定的 draw:created
        this.clearOnDrawCreated();
        this.map.on('draw:created', (event) => {
            this.drawnItems[floorIndex].addLayer(event.layer);
        });
    }

    private clearOnDrawCreated() {
        this.map.off('draw:created');
    }

    log() {
        console.log(this.drawnItems);
    }

    draw(type) {
        if (type === 'Rectangle') {
            const a = new Draw.Rectangle(this.map);
            a.initialize(this.map, {});
            a.enable();
        }
        if (type === 'Circle') {
            const a = new Draw.Circle(this.map);
            a.initialize(this.map, {});
            a.enable();
        }
        if (type === 'Polygon') {
            const a = new Draw.Polygon(this.map);
            a.initialize(this.map, {});
            a.enable();
        }
    }
}
