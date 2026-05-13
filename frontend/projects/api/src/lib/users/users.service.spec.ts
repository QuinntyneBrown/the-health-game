// Acceptance Test
// Traces to: L2-014
// Description: UsersService.getCurrentUser fetches /api/users/me and yields a typed UserProfile.
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_CONFIG, ApiConfig } from '../api.config';
import { UsersService } from './users.service';

const config: ApiConfig = {
  apiBaseUrl: 'http://localhost:5117',
  oidcAuthority: 'https://auth.example.test',
  oidcClientId: 'health-game-web-test',
  oidcScopes: 'openid profile email',
  oidcRedirectUri: 'http://localhost:4200/auth/callback',
  oidcPostLogoutRedirectUri: 'http://localhost:4200/auth/signed-out',
};

describe('UsersService', () => {
  let service: UsersService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: config },
      ],
    });
    service = TestBed.inject(UsersService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('GETs /api/users/me and returns the profile', async () => {
    const promise = firstValueFrom(service.getCurrentUser());
    const req = controller.expectOne(`${config.apiBaseUrl}/api/users/me`);
    expect(req.request.method).toBe('GET');
    req.flush({
      displayName: 'Ada Lovelace',
      email: 'ada@example.test',
      roles: [1, 2],
      createdAtUtc: '2026-05-09T10:00:00Z',
    });

    const profile = await promise;
    expect(profile.displayName).toBe('Ada Lovelace');
    expect(profile.email).toBe('ada@example.test');
    expect(profile.avatarUrl).toBeNull();
    expect(profile.roles).toEqual(['User', 'Admin']);
  });

  it('PUTs displayName and email to /api/users/me and returns the updated profile', async () => {
    const promise = firstValueFrom(
      service.updateCurrentUser({ displayName: 'Grace Hopper', email: 'grace@example.test' }),
    );
    const req = controller.expectOne(`${config.apiBaseUrl}/api/users/me`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      displayName: 'Grace Hopper',
      email: 'grace@example.test',
      timeZoneId: expect.any(String),
    });
    req.flush({
      displayName: 'Grace Hopper',
      email: 'grace@example.test',
      roles: [1],
      createdAtUtc: '2026-05-09T10:00:00Z',
    });

    const profile = await promise;
    expect(profile.displayName).toBe('Grace Hopper');
    expect(profile.email).toBe('grace@example.test');
  });

  it('DELETEs /api/users/me to remove the current user', async () => {
    const promise = firstValueFrom(service.deleteCurrentUser());
    const req = controller.expectOne(`${config.apiBaseUrl}/api/users/me`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
    await promise;
  });
});
