import { Component, OnInit, Input } from '@angular/core';
import { Map, interaction, layer, source, style, Feature, format } from 'openlayers';

import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';

@Component({
    selector: 'draw-tool',
    templateUrl: './draw-tool.component.html',
    styleUrls: ['./draw-tool.component.css']
})
export class DrawToolComponent implements OnInit {
    @Input() map: Map;
    // 输入内容验证结果提示信息
    validInfo = '';
    // 模态框是否可见
    modalVisible = false;
    // 提示框是否可见
    warningModalVisible: boolean;
    // 全局报错信息
    errInfo: string;
    // 按钮是否可用
    newMallDisable = false;

    // 建筑物属性
    mall = {
        name: '',
        startFloor: 1
    };

    // 当前绘图的图层，用于绘制内容和编辑
    private layerSource = new source.Vector();
    private vectorLayer: layer.Vector;
    // 绘制和选中、编辑面
    private polygonDraw: interaction.Draw;
    private polygonModify: interaction.Modify;
    private polygonSelect: interaction.Select;
    // 缓存要素数组，每一层楼的要素临时存放位置
    private features: Feature[][] = [];

    private formatGeojson = new format.GeoJSON();

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

    constructor() { }

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
        // 添加捕捉功能，必须要在Draw和Modi之后添加
        // The snap interaction must be added after the Modify and Draw interactions in order for its map browser event handlers to be fired first.
        // Its handlers are responsible of doing the snapping.
        const snap = new interaction.Snap({
            source: this.layerSource
        });
        this.map.addInteraction(snap);
    }

    /**
     * 创建MALL或者Floor
     * @param type 绘制类型
     */
    creat(type) {
        if (type === 'mall') {
            this.modalVisible = true;
        }
        const is = this.saveToCache(type);
        if (is) {
            this.clearInteraction();
            this.polygonDraw.setActive(true);
        }
    }

    /**
     * 把当前绘制的内容存到缓存要素数组中
     * @param type 当前绘制的类型
     */
    private saveToCache(type?: string) {
        const layerCurrentFeatures = this.layerSource.getFeatures();
        // 要创建floor，必须已经创建了mall，也即vector中要至少有一个要素
        if (type === 'floor' && layerCurrentFeatures.length > 0) {
            // 已经绘制了mall
            const floorIndex = this.features.length;
            // 如果当前绘制楼层为空，则不允许绘制新的楼层
            if (type === 'floor' && layerCurrentFeatures.length !== 1) {
                // 如果是新建Floor，则把上次绘制的Floor放到临时缓存图层数组中
                // 除去第一个要素（Mall的轮廓）之外的就是上一层Floor的要素
                this.features[floorIndex] = layerCurrentFeatures.slice(1);
                for (let i = 0; i < this.features[floorIndex].length; i++) {
                    const element = this.features[floorIndex][i];
                    element.setProperties({ id: this.randomString(32), floor: floorIndex });
                    this.layerSource.removeFeature(element);
                }
            }
        } else {
            if (type === 'floor') {
                this.warningModalVisible = true;
                this.errInfo = "请先创建Mall！";
                console.log('请先创建Mall！');
                return false;
            }
        }
        return true;
    }

    draw(event: Event, type) {
        event.stopPropagation();
        this.clearInteraction();
        this.polygonDraw.setActive(true);
    }

    edit(event: Event) {
        // 不能编辑Mall对应的要素，因为编辑之后，要素顺序会改变
        event.stopPropagation();
        this.clearInteraction();
        this.polygonSelect.setActive(true);
        this.polygonModify.setActive(true);
    }

    /**
     * 保存当前图层为geojson
     */
    save() {
        let features: Feature[] = [];
        // 保存之前，把所有的floor都保存到临时缓存图层中,所以vectorLayer只有一个feature
        this.saveToCache('floor');
        // mall
        features[0] = this.layerSource.getFeatures()[0];
        features[0].setProperties({ type: 'mall', id: this.randomString(32) });
        // floors
        this.features.forEach((item) => {
            features = features.concat(item);
        });
        const geojson = this.formatGeojson.writeFeatures(features);
        console.log(geojson);

        this.createAndDownloadFile('geo.json', geojson);
    }

    // 模态框关闭事件
    modalHidden(event) {
        if (event.result === 'cancle') {
            this.clearInteraction();
        } else {
            if (this.mall.name.trim() === '' || this.mall.startFloor.toString().trim() === '') {
                this.validInfo = "请输入楼宇名称和最低楼层！";
                return;
            }
            this.mall.startFloor = parseInt(this.mall.startFloor.toString().trim(), 0);
            if (isNaN(this.mall.startFloor)) {
                this.validInfo = "请输入正确的楼层数！";
                return;
            }
            this.validInfo = "";
            this.newMallDisable = true;
        }
        this.modalVisible = false;
    }

    // log st.
    log() {
        console.log(this.vectorLayer);
        console.log(this.layerSource);
        console.log('%c 当前图层中的要素：', 'color:green;font-weight:bold;');
        console.log(this.vectorLayer.getSource().getFeatures());
        // geometry 只有图形要素，没有属性，属性在feature上
        this.layerSource.getFeatures()[0].setProperties({ type: 'mall', id: '1s3334' });
        this.layerSource.getFeatures()[0].getGeometry().setProperties({ name: 'test', id: '1s3334' });
        console.log('%c 当前缓存中的要素：', 'color:green;font-weight:bold;');
        console.log(this.features);
        console.log(this.formatGeojson.writeFeatures(this.features[0]));
    }

    private clearInteraction() {
        this.polygonSelect.setActive(false);
        this.polygonModify.setActive(false);
        this.polygonDraw.setActive(false);
    }

    // 下载文件
    private createAndDownloadFile(fileName, content) {
        const aTag = document.createElement('a');
        const blob = new Blob([content]);
        aTag.download = fileName;
        aTag.href = URL.createObjectURL(blob);
        aTag.click();
        URL.revokeObjectURL(aTag.href);
    }

    /**
     * 生成随机字符串
     * @param len 字符串长度
     */
    private randomString(len?: number): string {
        len = len || 32;
        const $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        const maxPos = $chars.length;
        let pwd = '';
        for (let i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }

}
