import { AppEnvironment } from './environment.types';

export const environment: AppEnvironment = {
  production: true,
  apiBaseUrl: 'https://api.healthgame.app',
  oidcAuthority: 'https://auth.healthgame.app',
  oidcClientId: 'health-game-web',
  oidcScopes: 'openid profile email offline_access',
  oidcRedirectUri: 'https://app.healthgame.app/auth/callback',
  oidcPostLogoutRedirectUri: 'https://app.healthgame.app/',
};
