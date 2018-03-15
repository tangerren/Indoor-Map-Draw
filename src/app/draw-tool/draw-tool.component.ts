import { Component, OnInit, Input } from '@angular/core';

import { Map, interaction, layer, source, style, Feature } from 'openlayers';


import { GeojsonService } from '../services/geojson.service';

@Component({
    selector: 'draw-tool',
    templateUrl: './draw-tool.component.html',
    styleUrls: ['./draw-tool.component.css']
})
export class DrawToolComponent implements OnInit {

    @Input() map: any;

    private vectorLayer: layer.Vector;
    private polygonDraw: interaction.Draw;
    private polygonModify: interaction.Modify;
    private polygonSelect: interaction.Select;
    private features: Feature[][] = [];

    private layerSource = new source.Vector();
    private style = new style.Style({
        fill: new style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new style.Stroke({
            color: '#ffcc33',
            width: 6,
            lineJoin: 'bevel',
            lineDash: [10, 10, 10],
            lineCap: 'square'
        }),
        image: new style.Circle({
            radius: 7,
            fill: new style.Fill({
                color: '#ffcc33'
            })
        })
    });

    constructor(private geojsonService: GeojsonService) { }

    ngOnInit() {
        // 创建绘图图层
        this.vectorLayer = new layer.Vector({
            source: this.layerSource,
            style: this.style
        });
        this.map.addLayer(this.vectorLayer);
        // 创建绘图要素
        this.polygonDraw = new interaction.Draw({
            source: this.layerSource,
            type: 'Polygon'
        });
        // 添加绘图交互
        this.map.addInteraction(this.polygonDraw);
        this.polygonDraw.setActive(false);
        // 添加捕捉功能
        // The snap interaction must be added after the Modify and Draw interactions
        // in order for its map browser event handlers to be fired first. Its handlers
        // are responsible of doing the snapping.
        const snap = new interaction.Snap({
            source: this.vectorLayer.getSource()
        });
        this.map.addInteraction(snap);
        // 选中交互
        this.polygonSelect = new interaction.Select();
        this.map.addInteraction(this.polygonSelect);
        this.polygonSelect.setActive(false);
        // 选中之后编辑交互
        this.polygonModify = new interaction.Modify({
            features: this.polygonSelect.getFeatures()
        });
        this.map.addInteraction(this.polygonModify);
        this.polygonModify.setActive(false);
        // 注册选中事件
        const selectedFeatures = this.polygonSelect.getFeatures();
        this.polygonSelect.on('change:active', function () {
            selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
        });
    }

    /**
     * 建筑物轮廓存在vectorLayer中，其他的楼层存放在feature数组中
     * @param type 绘制类型
     */
    creat(type) {
        const floorIndex = this.features.length;
        const tempFeatures = this.layerSource.getFeatures();
        if (type === 'floor' && tempFeatures.length === 0) {
            console.log('请先创建Mall！');
            return;
        } else {
            if (type === 'floor' && tempFeatures.length !== 1) {
                // 如果是新建Floor，则把上次绘制的Floor放到临时缓存图层数组中
                // 除去第一个要素（Mall的轮廓）之外的就是上一层Floor的要素
                this.features[floorIndex] = tempFeatures.slice(1);
                this.features[floorIndex].forEach((item) => {
                    this.layerSource.removeFeature(item);
                });
            }
        }
        this.clearInteraction();
        this.polygonDraw.setActive(true);
    }

    private clearInteraction() {
        this.polygonSelect.setActive(false);
        this.polygonModify.setActive(false);
        this.polygonDraw.setActive(false);
    }

    // log st.
    log() {
        console.log(this.vectorLayer);
        console.log(this.layerSource);
        console.log('当前图层中的要素：');
        console.log(this.vectorLayer.getSource().getFeatures());
        console.log('当前缓存中的要素：');
        console.log(this.features);
    }

    draw(event: Event, type) {
        event.stopPropagation();
        this.polygonDraw.setActive(true);
    }


    edit(event: Event, type) {
        event.stopPropagation();
        this.clearInteraction()
        this.polygonSelect.setActive(true);
        this.polygonModify.setActive(true);
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
