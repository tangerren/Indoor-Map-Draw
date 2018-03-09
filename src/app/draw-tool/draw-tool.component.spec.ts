import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawToolComponent } from './draw-tool.component';

describe('DrawToolComponent', () => {
  let component: DrawToolComponent;
  let fixture: ComponentFixture<DrawToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrawToolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
