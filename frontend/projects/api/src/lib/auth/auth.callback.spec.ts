// Acceptance Test
// Traces to: L2-013, L2-017
// Description: AuthService.handleRedirect exchanges the auth code for tokens.
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG, ApiConfig } from '../api.config';
import {
  AuthService,
  STATE_KEY,
  VERIFIER_KEY,
} from './auth.service';

const config: ApiConfig = {
  apiBaseUrl: 'http://localhost:5117',
  oidcAuthority: 'https://auth.example.test',
  oidcClientId: 'health-game-web-test',
  oidcScopes: 'openid profile email',
  oidcRedirectUri: 'http://localhost:4200/auth/callback',
  oidcPostLogoutRedirectUri: 'http://localhost:4200/',
};

describe('AuthService.handleRedirect', () => {
  let service: AuthService;
  let controller: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(VERIFIER_KEY, 'test-verifier');
    sessionStorage.setItem(STATE_KEY, 'test-state');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: config },
      ],
    });
    service = TestBed.inject(AuthService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('POSTs to {oidcAuthority}/connect/token with the authorization code and verifier', async () => {
    const promise = service.handleRedirect('the-code', 'test-state');

    const req = controller.expectOne('https://auth.example.test/connect/token');
    expect(req.request.method).toBe('POST');
    const body = req.request.body as URLSearchParams;
    expect(body.get('grant_type')).toBe('authorization_code');
    expect(body.get('code')).toBe('the-code');
    expect(body.get('redirect_uri')).toBe('http://localhost:4200/auth/callback');
    expect(body.get('client_id')).toBe('health-game-web-test');
    expect(body.get('code_verifier')).toBe('test-verifier');

    req.flush({ access_token: 'token-abc', token_type: 'Bearer', expires_in: 3600 });
    await promise;

    expect(service.getAccessToken()).toBe('token-abc');
    expect(sessionStorage.getItem(VERIFIER_KEY)).toBeNull();
  });

  it('rejects when the returned state does not match the stored state', async () => {
    let caught: unknown;
    try {
      await service.handleRedirect('the-code', 'wrong-state');
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toMatch(/state/i);
  });
});
