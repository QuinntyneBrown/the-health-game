import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  readonly apiBaseUrl: string;
  readonly oidcAuthority: string;
  readonly oidcClientId: string;
  readonly oidcScopes: string;
  readonly oidcRedirectUri: string;
  readonly oidcPostLogoutRedirectUri: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');
