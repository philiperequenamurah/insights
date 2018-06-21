
import { TestBed, async, inject } from '@angular/core/testing';
import { DashboardAudiService } from './dashboard-audi-service';

describe('Service: Users', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardAudiService]
    });
  });

  it('should ...', inject([DashboardAudiService], (service: DashboardAudiService) => {
    expect(service).toBeTruthy();
  }));
});