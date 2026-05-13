// Acceptance Test
// Traces to: L2-015
// Description: roleGuard allows the route when the user has the role; otherwise redirects to /.
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { UrlTree } from '@angular/router';

import { API_CONFIG, ApiConfig } from '../api.config';
import { AuthService, OIDC_REDIRECTOR } from './auth.service';
import { AUTH_SERVICE } from './auth.service.contract';
import { roleGuard } from './role.guard';

const config: ApiConfig = {
  apiBaseUrl: 'http://localhost:5117',
  oidcAuthority: 'https://auth.example.test',
  oidcClientId: 'health-game-web-test',
  oidcScopes: 'openid profile email',
  oidcRedirectUri: 'http://localhost:4200/auth/callback',
  oidcPostLogoutRedirectUri: 'http://localhost:4200/auth/signed-out',
};

describe('roleGuard("admin")', () => {
  let auth: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: API_CONFIG, useValue: config },
        { provide: AUTH_SERVICE, useExisting: AuthService },
        { provide: OIDC_REDIRECTOR, useValue: () => undefined },
      ],
    });
    auth = TestBed.inject(AuthService);
  });

  function run(): boolean | UrlTree {
    return TestBed.runInInjectionContext(() => roleGuard('admin')({} as never, []) as boolean | UrlTree);
  }

  it('allows the route when the user has the role', () => {
    auth.setRolesForTest(['admin']);
    expect(run()).toBe(true);
  });

  it('redirects to / when the user does not have the role', () => {
    auth.setRolesForTest(['user']);
    const result = run();
    expect(result).not.toBe(true);
    expect((result as UrlTree).toString()).toBe('/');
  });
});

describe('AuthService.hasRole', () => {
  it('reflects the roles set on the service', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: API_CONFIG, useValue: config },
      ],
    });
    const auth = TestBed.inject(AuthService);
    auth.setRolesForTest(['user']);
    expect(auth.hasRole('admin')).toBe(false);
    auth.setRolesForTest(['admin', 'user']);
    expect(auth.hasRole('admin')).toBe(true);
  });
});
