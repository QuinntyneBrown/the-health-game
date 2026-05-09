// Acceptance Test
// Traces to: L2-013, L2-015
// Description: authGuard allows authenticated routes; otherwise redirects to OIDC sign-in.
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { UrlSegment } from '@angular/router';

import { API_CONFIG, ApiConfig } from '../api.config';
import { authGuard } from './auth.guard';
import { AuthService, OIDC_REDIRECTOR } from './auth.service';

const config: ApiConfig = {
  apiBaseUrl: 'http://localhost:5117',
  oidcAuthority: 'https://auth.example.test',
  oidcClientId: 'health-game-web-test',
  oidcScopes: 'openid profile email',
  oidcRedirectUri: 'http://localhost:4200/auth/callback',
  oidcPostLogoutRedirectUri: 'http://localhost:4200/auth/signed-out',
};

describe('authGuard', () => {
  let auth: AuthService;
  let signInCalls: string[];

  beforeEach(() => {
    sessionStorage.clear();
    signInCalls = [];
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: API_CONFIG, useValue: config },
        { provide: OIDC_REDIRECTOR, useValue: () => undefined },
      ],
    });
    auth = TestBed.inject(AuthService);
    const original = auth.signIn.bind(auth);
    auth.signIn = async (returnUrl?: string) => {
      signInCalls.push(returnUrl ?? '');
      return original.call(auth);
    };
  });

  function runGuard(segments: string[]): boolean {
    const urlSegments = segments.map((s) => new UrlSegment(s, {}));
    return TestBed.runInInjectionContext(
      () => authGuard({} as never, urlSegments) as boolean,
    );
  }

  it('allows access when authenticated', () => {
    auth.setAccessTokenForTest('token');
    expect(runGuard(['goals'])).toBe(true);
    expect(signInCalls).toEqual([]);
  });

  it('blocks and triggers signIn with the attempted URL when not authenticated', () => {
    expect(runGuard(['goals'])).toBe(false);
    expect(signInCalls).toEqual(['/goals']);
  });
});

describe('AuthService.isAuthenticated', () => {
  it('reflects token presence', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: API_CONFIG, useValue: config },
      ],
    });
    const service = TestBed.inject(AuthService);
    expect(service.isAuthenticated()).toBe(false);
    service.setAccessTokenForTest('token');
    expect(service.isAuthenticated()).toBe(true);
  });
});
