import { Component, OnInit, Input } from '@angular/core';

import { FeatureGroup, Control, Draw } from 'leaflet';

import 'leaflet-draw';

import { GeojsonService } from '../services/geojson.service';

@Component({
    selector: 'draw-tool',
    templateUrl: './draw-tool.component.html',
    styleUrls: ['./draw-tool.component.css']
})
export class DrawToolComponent implements OnInit {

    @Input() map: any;
    drawnItems: FeatureGroup[] = [];
    constructor(private geojsonService: GeojsonService) { }

    ngOnInit() {

    }

    /**
     * 每个Floor对应一个drawnItems
     * @param type 绘制类型
     */
    creat(type) {
        const floorIndex = this.drawnItems.length;
        if (floorIndex === 0 && type === 'floor') {
            console.log('请先创建Mall！');
            return;
        }
        this.drawnItems[floorIndex] = new FeatureGroup();
        // this.drawnItems[floorIndex].index = floorIndex;
        this.map.addLayer(this.drawnItems[floorIndex]);
        // 清除前几个图层绑定的 draw:created
        this.clearOnDrawCreated();
        this.map.on(Draw.Event.CREATED, (event) => {
            this.drawnItems[floorIndex].addLayer(event.layer);
            event.layer.feature = {};
            event.layer.feature.properties = { id: this.randomString(32) };
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

    /**
     * 生成随机字符串
     * @param len 字符串长度
     */
    private randomString(len): string {
        len = len || 32;
        const $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        const maxPos = $chars.length;
        let pwd = '';
        for (let i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }

    save() {
        this.geojsonService.toGeoJSON();
    }
}
