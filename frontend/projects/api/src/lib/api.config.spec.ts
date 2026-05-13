// Acceptance Test
// Traces to: L2-013, L2-017
// Description: provideApiServices accepts an ApiConfig and registers API_CONFIG.
import { TestBed } from '@angular/core/testing';

import { ACTIVITIES_SERVICE } from './activities/activities.service.contract';
import { API_CONFIG, ApiConfig } from './api.config';
import { provideApiServices } from './api.providers';
import { AUTH_SERVICE } from './auth/auth.service.contract';
import { GOALS_SERVICE } from './goals/goals.service.contract';
import { REWARDS_SERVICE } from './rewards/rewards.service.contract';
import { USERS_SERVICE } from './users/users.service.contract';

describe('API_CONFIG', () => {
  it('is registered with the value passed to provideApiServices', () => {
    const config: ApiConfig = {
      apiBaseUrl: 'https://api.example.test',
      oidcAuthority: 'https://auth.example.test',
      oidcClientId: 'health-game-web-test',
      oidcScopes: 'openid profile email',
      oidcRedirectUri: 'http://localhost:4200/auth/callback',
      oidcPostLogoutRedirectUri: 'http://localhost:4200/',
    };

    TestBed.configureTestingModule({ providers: [provideApiServices(config)] });

    expect(TestBed.inject(API_CONFIG)).toEqual(config);
  });

  it('binds service contracts to concrete API implementations', () => {
    const config: ApiConfig = {
      apiBaseUrl: 'https://api.example.test',
      oidcAuthority: 'https://auth.example.test',
      oidcClientId: 'health-game-web-test',
      oidcScopes: 'openid profile email',
      oidcRedirectUri: 'http://localhost:4200/auth/callback',
      oidcPostLogoutRedirectUri: 'http://localhost:4200/',
    };

    TestBed.configureTestingModule({ providers: [provideApiServices(config)] });

    expect(TestBed.inject(ACTIVITIES_SERVICE)).toBeTruthy();
    expect(TestBed.inject(AUTH_SERVICE)).toBeTruthy();
    expect(TestBed.inject(GOALS_SERVICE)).toBeTruthy();
    expect(TestBed.inject(REWARDS_SERVICE)).toBeTruthy();
    expect(TestBed.inject(USERS_SERVICE)).toBeTruthy();
  });
});
