
import { TestBed, async, inject } from '@angular/core/testing';
import { GlpiService } from './glpi-service';

describe('Service: Users', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlpiService]
    });
  });

  it('should ...', inject([GlpiService], (service: GlpiService) => {
    expect(service).toBeTruthy();
  }));
});