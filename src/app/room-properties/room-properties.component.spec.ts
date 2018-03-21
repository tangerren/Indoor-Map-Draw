import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomPropertiesComponent } from './properties.component';

describe('PropertiesComponent', () => {
  let component: RoomPropertiesComponent;
  let fixture: ComponentFixture<RoomPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
