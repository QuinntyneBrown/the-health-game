// Acceptance Test
// Traces to: L2-013, L2-014
// Description: AuthService.signOut redirects to the OIDC end-session endpoint and clears local state.
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG, ApiConfig } from '../api.config';
import { AuthService, OIDC_REDIRECTOR } from './auth.service';

const config: ApiConfig = {
  apiBaseUrl: 'http://localhost:5117',
  oidcAuthority: 'https://auth.example.test',
  oidcClientId: 'health-game-web-test',
  oidcScopes: 'openid profile email',
  oidcRedirectUri: 'http://localhost:4200/auth/callback',
  oidcPostLogoutRedirectUri: 'http://localhost:4200/auth/signed-out',
};

describe('AuthService.signOut', () => {
  let service: AuthService;
  let assignedUrl: string | null;

  beforeEach(() => {
    sessionStorage.clear();
    assignedUrl = null;
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: API_CONFIG, useValue: config },
        { provide: OIDC_REDIRECTOR, useValue: (url: string) => (assignedUrl = url) },
      ],
    });
    service = TestBed.inject(AuthService);
    service.setAccessTokenForTest('current-token');
  });

  it('clears the in-memory access token', () => {
    service.signOut();
    expect(service.getAccessToken()).toBeNull();
  });

  it('redirects to {oidcAuthority}/connect/endsession with post_logout_redirect_uri and client_id', () => {
    service.signOut();

    expect(assignedUrl).not.toBeNull();
    const url = new URL(assignedUrl!);
    expect(url.origin).toBe('https://auth.example.test');
    expect(url.pathname).toBe('/connect/endsession');
    expect(url.searchParams.get('post_logout_redirect_uri')).toBe(
      'http://localhost:4200/auth/signed-out',
    );
    expect(url.searchParams.get('client_id')).toBe('health-game-web-test');
  });
});
