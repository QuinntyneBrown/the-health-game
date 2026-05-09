// Acceptance Test
// Traces to: L2-013
// Description: AuthService.signIn redirects to the OIDC authority with PKCE parameters.
import { TestBed } from '@angular/core/testing';

import { API_CONFIG, ApiConfig } from '../api.config';
import { AuthService } from './auth.service';

describe('AuthService.signIn', () => {
  const config: ApiConfig = {
    apiBaseUrl: 'http://localhost:5117',
    oidcAuthority: 'https://auth.example.test',
    oidcClientId: 'health-game-web-test',
    oidcScopes: 'openid profile email',
    oidcRedirectUri: 'http://localhost:4200/auth/callback',
    oidcPostLogoutRedirectUri: 'http://localhost:4200/',
  };
  let assignedUrl: string | null;

  beforeEach(() => {
    assignedUrl = null;
    TestBed.configureTestingModule({
      providers: [
        { provide: API_CONFIG, useValue: config },
        {
          provide: AuthService,
          useFactory: () => new AuthService(config, (url) => (assignedUrl = url)),
        },
      ],
    });
  });

  it('redirects to {oidcAuthority}/connect/authorize with PKCE code challenge', async () => {
    const service = TestBed.inject(AuthService);

    await service.signIn();

    expect(assignedUrl).not.toBeNull();
    const url = new URL(assignedUrl!);
    expect(url.origin).toBe('https://auth.example.test');
    expect(url.pathname).toBe('/connect/authorize');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('client_id')).toBe('health-game-web-test');
    expect(url.searchParams.get('redirect_uri')).toBe(
      'http://localhost:4200/auth/callback',
    );
    expect(url.searchParams.get('scope')).toBe('openid profile email');
    expect(url.searchParams.get('code_challenge')).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(url.searchParams.get('state')).toMatch(/^[A-Za-z0-9_-]{16,}$/);
  });

  it('persists the PKCE verifier in sessionStorage for the callback', async () => {
    const service = TestBed.inject(AuthService);

    await service.signIn();

    expect(sessionStorage.getItem('hg.oidc.verifier')).toMatch(/^[A-Za-z0-9_-]{43,}$/);
  });
});
