import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MallProp } from '../../types/MallProp';

@Component({
  selector: 'project-modal',
  templateUrl: './project-modal.component.html',
  styleUrls: ['./project-modal.component.css']
})
export class ProjectModalComponent implements OnInit {

  modalVisible = false;
  mallForm: FormGroup;


  @Input() title: string;
  @Input() lable: string;
  @Input() mall: MallProp;

  ngOnInit() {
    this.mallForm = this.fb.group({
      name: [null, [Validators.required]],
      floors: [null, [Validators.required]],
      startFloor: [null, [Validators.required]]
    });
    this.mallForm.get('name').setValue(this.mall.name);
    this.mallForm.get('floors').setValue(this.mall.floors);
    this.mallForm.get('startFloor').setValue(this.mall.startFloor);
  }

  constructor(private fb: FormBuilder) { }

  showModal(): void {
    this.modalVisible = true;
  }

  handleOk(): void {
    console.log('Button ok clicked!');
    this.modalVisible = false;
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.modalVisible = false;
  }
}
