import { Component, OnInit, Input, ContentChild, TemplateRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.css']
})
export class ModalDialogComponent implements OnInit {

  @Input() title: string;
  @Input() visible: any;
  @Output() hideModal = new EventEmitter();

  @ContentChild('header') headerTmp: TemplateRef<any>;
  @ContentChild('content') contentTmp: TemplateRef<any>;
  @ContentChild('footer') footerTmp: TemplateRef<any>;

  constructor() { }
  ngOnInit() {
    this.title = this.title || "信息";
  }

  cancle() {
    this.visible = false;
    this.hideModal.emit(this.visible);
    console.log("取消模态框内容！");
  }

  ok() {
    this.visible = false;
    this.hideModal.emit(this.visible);
    console.log("确认模态框内容！");
  }


}
