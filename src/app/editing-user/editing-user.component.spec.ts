import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditingUserComponent } from './editing-user.component';

describe('EditingUserComponent', () => {
  let component: EditingUserComponent;
  let fixture: ComponentFixture<EditingUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditingUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditingUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
