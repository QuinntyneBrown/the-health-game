// Acceptance Test
// Traces to: L2-013, L2-017
// Description: authInterceptor attaches Bearer token to apiBaseUrl requests only.
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_CONFIG, ApiConfig } from '../api.config';
import { AuthService } from './auth.service';
import { AUTH_SERVICE } from './auth.service.contract';
import { authInterceptor } from './auth.interceptor';

const config: ApiConfig = {
  apiBaseUrl: 'http://localhost:5117',
  oidcAuthority: 'https://auth.example.test',
  oidcClientId: 'health-game-web-test',
  oidcScopes: 'openid profile email',
  oidcRedirectUri: 'http://localhost:4200/auth/callback',
  oidcPostLogoutRedirectUri: 'http://localhost:4200/',
};

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: config },
        { provide: AUTH_SERVICE, useExisting: AuthService },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    TestBed.inject(AuthService).setAccessTokenForTest('test-token');
  });

  afterEach(() => controller.verify());

  it('attaches Authorization Bearer for requests on apiBaseUrl', async () => {
    const promise = firstValueFrom(http.get(`${config.apiBaseUrl}/users/me`));
    const req = controller.expectOne(`${config.apiBaseUrl}/users/me`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({});
    await promise;
  });

  it('does not attach Authorization for non-apiBaseUrl requests', async () => {
    const promise = firstValueFrom(http.get('https://other.example.test/data'));
    const req = controller.expectOne('https://other.example.test/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
    await promise;
  });
});
