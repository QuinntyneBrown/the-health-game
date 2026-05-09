import { AppEnvironment } from './environment.types';

export const environment: AppEnvironment = {
  production: false,
  apiBaseUrl: 'http://localhost:5117',
  oidcAuthority: 'http://localhost:5118',
  oidcClientId: 'health-game-web-dev',
  oidcScopes: 'openid profile email offline_access',
  oidcRedirectUri: 'http://localhost:4200/auth/callback',
  oidcPostLogoutRedirectUri: 'http://localhost:4200/',
};
