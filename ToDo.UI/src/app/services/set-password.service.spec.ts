import { TestBed } from '@angular/core/testing';

import { SetPasswordService } from './set-password.service';

describe('SetPasswordService', () => {
  let service: SetPasswordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SetPasswordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
