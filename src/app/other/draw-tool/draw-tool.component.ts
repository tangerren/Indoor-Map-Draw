import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Map, interaction, layer, source, style, Feature, format } from 'openlayers';

import { lineString } from '@turf/turf';

import { RoomPropertiesComponent } from '../room-properties/room-properties.component';
import { PolygonSlice } from '../../gis-util/split-polygon';


@Component({
    selector: 'draw-tool',
    templateUrl: './draw-tool.component.html',
    styleUrls: ['./draw-tool.component.css']
})
export class DrawToolComponent implements OnInit {

    polyLineDraw: interaction.Draw;
    @Input() map: Map;

    @ViewChild('roomProp')
    roomProp: RoomPropertiesComponent;

    // 输入内容验证结果提示信息
    validInfo = '';
    validRoomInfo = '';
    // 模态框是否可见
    modalVisible = false;
    // 提示框是否可见
    warningModalVisible: boolean;
    roomModalVisible: boolean;
    // 全局报错信息
    errInfo: string;
    // 按钮是否可用
    newMallDisable = false;
    // 当前正在展示或绘制的楼层
    currentFloor: number;
    floors = [];

    // 建筑物属性
    mall = {
        id: '',
        name: '',
        floors: 1,
        startFloor: 1
    };

    // 房间属性
    roomProperties = {
        id: '3sds4sfpcjtbslf8bmhiebhri4', // 唯一标识
        name: '', // 名称
        floor: 2, // 所在楼层
        type: 'sm', // 房间类型
        pName: '张无忌', // 联系人姓名
        pTel: '15333333333' // 联系人电话
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
        this.polyLineDraw = new interaction.Draw({
            source: this.layerSource,
            type: 'LineString'
        });
        //   在绘制结束后添加属性 drawend 事件
        this.polyLineDraw.on('drawend', (e: interaction.Draw.Event) => {
            let prop = null;
            // 分割要素

            let sP = new PolygonSlice();

            console.log(this.polygonSelect.getFeatures[0]);

            let eG: ol.geom.LineString = e.feature.getGeometry() as ol.geom.LineString;
            let splited = sP.split(this.polygonSelect.getFeatures[0], lineString(eG.getCoordinates()));

            console.log(splited);
        });
        this.map.addInteraction(this.polyLineDraw);
        this.polyLineDraw.setActive(false);


        // 创建绘图要素
        this.polygonDraw = new interaction.Draw({
            source: this.layerSource,
            type: 'Polygon'
        });
        //   在绘制结束后添加属性 drawend 事件
        this.polygonDraw.on('drawend', (e: interaction.Draw.Event) => {
            let prop = null;
            // 绘制结束后，判断当前楼层，如果是0层，则表示是建筑物轮廓
            if (!this.currentFloor) {
                // 当前绘制或展示的是mall轮廓
                this.creat('floor');
                // TODO:  使用turf计算中心点
                prop = { id: this.randomString(32), floor: 0, floors: this.mall.floors, center: [0, 0] };
            } else {
                // 绘制的是floor
                prop = { id: this.randomString(32), floor: this.currentFloor };
            }
            e.feature.setProperties(prop);
        });
        // 添加绘图交互
        this.map.addInteraction(this.polygonDraw);
        this.polygonDraw.setActive(false);
        // 选中交互
        this.polygonSelect = new interaction.Select();
        this.map.addInteraction(this.polygonSelect);
        // this.polygonSelect.setActive(false);
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
            this.currentFloor = 0;
        } else if (isNaN(this.currentFloor)) {
            this.warningModalVisible = true;
            this.errInfo = "请先创建Mall！";
            console.log('请先创建Mall！');
            return false;
        } else if (this.layerSource.getFeatures().length === 1) {
            // 如果当前绘制楼层为空，则不允许绘制新的楼层
            this.warningModalVisible = true;
            this.errInfo = "当前楼层为空，请在当前楼层中绘制！";
            console.log('当前楼层为空，请在当前楼层中绘制！');
            return false;
        } else {
            if (this.currentFloor === 0) {
                this.currentFloor = this.mall.startFloor;
            } else {
                // 如果是从负楼层开始，则跳过0层（mall）
                if (this.currentFloor++ === 0) {
                    this.currentFloor++;
                }
            }
            // TODO:  最大楼层检测
            this.floors.push(this.currentFloor);
            this.saveToCache();
        }
        this.clearInteraction();
        this.polygonDraw.setActive(true);
    }

    /**
     * 新建楼层时候，把上一步绘制的floor缓存到缓存要素数组中
     * @param type 当前绘制的类型
     */
    private saveToCache() {
        const layerCurrentFeatures = this.layerSource.getFeatures();
        // 要创建floor，必须已经创建了mall，也即vector中要至少有一个要素
        if (layerCurrentFeatures.length > 0) {
            // 已经绘制了mall
            const floorIndex = this.features.length;
            // 如果是新建Floor，则把上次绘制的Floor放到临时缓存图层数组中
            // 除去第一个要素（Mall的轮廓）之外的就是上一层Floor的要素
            this.features[floorIndex] = layerCurrentFeatures.slice(1);
            for (let i = 0; i < this.features[floorIndex].length; i++) {
                const element = this.features[floorIndex][i];
                this.layerSource.removeFeature(element);
            }
        }
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

    drawClipLine(event: Event, type) {
        event.stopPropagation();
        this.clearInteraction();
        this.polyLineDraw.setActive(true);
    }

    /**
     * 保存当前图层为geojson
     */
    save() {
        let saveFeatures: Feature[] = [];
        // 保存之前，把所有的floor都保存到临时缓存图层中,所以vectorLayer只有一个feature
        if (this.layerSource.getFeatures().length === 1) {
            this.saveToCache();
        }
        // mall
        saveFeatures[0] = this.layerSource.getFeatures()[0];
        // floors
        this.features.forEach((item) => {
            saveFeatures = saveFeatures.concat(item);
        });
        // export
        const geojson = this.formatGeojson.writeFeatures(saveFeatures);
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

    roomModalHidden(event) {
        if (event.result === 'ok') {
            this.validRoomInfo = this.roomProp.validate();
            if (!this.validRoomInfo) {
                return;
            } else {
                this.roomProp.saveInfo();
            }
        }
        // this.clearInteraction();
        this.roomModalVisible = false;
    }

    // 赋属性
    writeRoomProp(event) {
        this.clearInteraction();
        this.polygonSelect.setActive(true);
        this.polygonSelect.on('select', (e: interaction.Select.Event) => {
            this.roomProperties.id = e.selected[0].getProperties().id;
            this.roomModalVisible = true;
        });
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
        // this.polygonSelect.setActive(false);
        this.polygonModify.setActive(false);
        this.polygonDraw.setActive(false);
        this.polygonSelect.un('select', null);
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
