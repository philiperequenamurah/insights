
import { TestBed, async, inject } from '@angular/core/testing';
import { DashboardService } from './dashboard-service';

describe('Service: Users', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardService]
    });
  });

  it('should ...', inject([DashboardService], (service: DashboardService) => {
    expect(service).toBeTruthy();
  }));
});