import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetPasswordComponent } from './setpassword.component';

describe('SetpasswordComponent', () => {
  let component: SetPasswordComponent;
  let fixture: ComponentFixture<SetPasswordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SetPasswordComponent]
    });
    fixture = TestBed.createComponent(SetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
