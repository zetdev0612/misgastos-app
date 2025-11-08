import { TestBed } from '@angular/core/testing';

import { Transaccion } from './transaccion';

describe('Transaccion', () => {
  let service: Transaccion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Transaccion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
