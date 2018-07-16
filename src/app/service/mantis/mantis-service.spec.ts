
import { TestBed, async, inject } from '@angular/core/testing';
import { MantisService } from './mantis-service';

describe('Service: Users', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MantisService]
    });
  });

  it('should ...', inject([MantisService], (service: MantisService) => {
    expect(service).toBeTruthy();
  }));
});