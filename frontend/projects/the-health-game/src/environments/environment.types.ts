export interface AppEnvironment {
  readonly production: boolean;
  readonly apiBaseUrl: string;
  readonly oidcAuthority: string;
  readonly oidcClientId: string;
  readonly oidcScopes: string;
  readonly oidcRedirectUri: string;
  readonly oidcPostLogoutRedirectUri: string;
}
