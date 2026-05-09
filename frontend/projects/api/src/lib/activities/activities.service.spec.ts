// Acceptance Test
// Traces to: L2-005
// Description: ActivitiesService.logActivity POSTs to /api/goals/{goalId}/activities.
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_CONFIG, ApiConfig } from '../api.config';
import { ActivitiesService } from './activities.service';

const config: ApiConfig = {
  apiBaseUrl: 'http://localhost:5117',
  oidcAuthority: 'https://auth.example.test',
  oidcClientId: 'health-game-web-test',
  oidcScopes: 'openid profile email',
  oidcRedirectUri: 'http://localhost:4200/auth/callback',
  oidcPostLogoutRedirectUri: 'http://localhost:4200/auth/signed-out',
};

describe('ActivitiesService.logActivity', () => {
  let service: ActivitiesService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: config },
      ],
    });
    service = TestBed.inject(ActivitiesService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('POSTs the input to /api/goals/:goalId/activities and returns the new entry', async () => {
    const promise = firstValueFrom(
      service.logActivity('g-1', { quantity: 2, notes: 'morning walk' }),
    );
    const req = controller.expectOne(`${config.apiBaseUrl}/api/goals/g-1/activities`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ quantity: 2, notes: 'morning walk' });
    req.flush({
      id: 'a-1',
      goalId: 'g-1',
      quantity: 2,
      notes: 'morning walk',
      recordedAt: '2026-05-09T10:00:00Z',
    });
    const entry = await promise;
    expect(entry.id).toBe('a-1');
    expect(entry.quantity).toBe(2);
  });

  it('GETs /api/goals/:goalId/activities and returns the entries', async () => {
    const promise = firstValueFrom(service.getGoalActivities('g-1'));
    const req = controller.expectOne(`${config.apiBaseUrl}/api/goals/g-1/activities`);
    expect(req.request.method).toBe('GET');
    req.flush([
      { id: 'a-1', goalId: 'g-1', quantity: 2, notes: 'morning', recordedAt: '2026-05-09T10:00:00Z' },
      { id: 'a-2', goalId: 'g-1', quantity: 4, notes: null, recordedAt: '2026-05-08T08:00:00Z' },
    ]);
    expect((await promise).length).toBe(2);
  });

  it('PUTs the update body to /api/activities/:id and returns the updated entry', async () => {
    const promise = firstValueFrom(
      service.updateActivityEntry('a-1', { quantity: 5, notes: 'corrected' }),
    );
    const req = controller.expectOne(`${config.apiBaseUrl}/api/activities/a-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ quantity: 5, notes: 'corrected' });
    req.flush({
      id: 'a-1',
      goalId: 'g-1',
      quantity: 5,
      notes: 'corrected',
      recordedAt: '2026-05-09T10:00:00Z',
    });
    expect((await promise).quantity).toBe(5);
  });

  it('DELETEs /api/activities/:id', async () => {
    const promise = firstValueFrom(service.deleteActivityEntry('a-1'));
    const req = controller.expectOne(`${config.apiBaseUrl}/api/activities/a-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
    await promise;
  });
});
