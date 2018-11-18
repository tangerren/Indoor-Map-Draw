import { Component, OnInit, Input, ContentChild, TemplateRef, Output, EventEmitter, ElementRef, OnDestroy } from '@angular/core';

@Component({
  selector: 'modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.css']
})
export class ModalDialogComponent implements OnInit, OnDestroy {

  @Input() title: string;
  @Output() modalHidden = new EventEmitter();

  @ContentChild('header') headerTmp: TemplateRef<any>;
  @ContentChild('content') contentTmp: TemplateRef<any>;
  @ContentChild('footer') footerTmp: TemplateRef<any>;

  constructor(protected elementRef: ElementRef) { }

  ele: any;

  ngOnInit() {
    this.title = this.title || "信息";
    this.ele = this.elementRef.nativeElement.querySelector('.modal-content');
    this.ele.className = 'modal-content fadeIn';
  }

  ngOnDestroy() {
     this.ele.className = 'modal-content fadeOut';

  }
  cancle() {
    this.modalHidden.emit({ result: 'cancle' });
    console.log("取消模态框内容！");
  }

  ok() {
    this.modalHidden.emit({ result: 'ok' });
    console.log("确认模态框内容！");
  }


}
