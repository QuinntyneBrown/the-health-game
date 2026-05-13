import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_CONFIG } from '../api.config';

export const VERIFIER_KEY = 'hg.oidc.verifier';
export const STATE_KEY = 'hg.oidc.state';
export const RETURN_URL_KEY = 'hg.oidc.return-url';
export const ACCESS_TOKEN_KEY = 'hg.oidc.access-token';

export type Redirector = (url: string) => void;

export const OIDC_REDIRECTOR = new InjectionToken<Redirector>('OIDC_REDIRECTOR', {
  providedIn: 'root',
  factory: () => (url: string) => window.location.assign(url),
});

interface TokenResponse {
  readonly access_token: string;
  readonly token_type: string;
  readonly expires_in: number;
  readonly refresh_token?: string;
  readonly id_token?: string;
}

interface PasswordSignInResponse {
  readonly accessToken: string;
  readonly tokenType: string;
  readonly expiresAtUtc: string;
  readonly user: {
    readonly id: string;
    readonly subjectId: string;
    readonly displayName: string;
    readonly email: string;
    readonly timeZoneId: string;
    readonly roles: readonly (string | number)[];
    readonly createdAtUtc: string;
    readonly updatedAtUtc: string | null;
  };
}

const ROLE_NAMES = ['User', 'Admin'] as const;

function normalizeRole(role: string | number): string {
  if (typeof role === 'string') {
    return role;
  }
  return ROLE_NAMES[role] ?? String(role);
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly config = inject(API_CONFIG);
  private readonly redirect = inject(OIDC_REDIRECTOR);
  private readonly http = inject(HttpClient);
  private readonly accessToken = signal<string | null>(readPersistedAccessToken());
  private readonly rolesSignal = signal<readonly string[]>([]);

  async signIn(returnUrl?: string, options?: { prompt?: 'login' | 'none' }): Promise<void> {
    const verifier = randomBase64Url(32);
    const state = randomBase64Url(16);
    sessionStorage.setItem(VERIFIER_KEY, verifier);
    sessionStorage.setItem(STATE_KEY, state);
    if (returnUrl) {
      sessionStorage.setItem(RETURN_URL_KEY, returnUrl);
    }

    const challenge = await createAuthorizationChallenge(verifier);

    const url = new URL('/connect/authorize', this.config.oidcAuthority);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.config.oidcClientId);
    url.searchParams.set('redirect_uri', this.config.oidcRedirectUri);
    url.searchParams.set('scope', this.config.oidcScopes);
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('code_challenge_method', 'S256');
    if (options?.prompt) {
      url.searchParams.set('prompt', options.prompt);
    }

    this.redirect(url.toString());
  }

  async signInWithPassword(usernameOrEmail: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<PasswordSignInResponse>(
        `${this.config.apiBaseUrl}/api/auth/sign-in`,
        { usernameOrEmail, password },
      ),
    );

    this.accessToken.set(response.accessToken);
    sessionStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    this.rolesSignal.set(response.user.roles.map(normalizeRole));
  }

  async handleRedirect(code: string, state: string): Promise<void> {
    const expectedState = sessionStorage.getItem(STATE_KEY);
    if (!expectedState || state !== expectedState) {
      throw new Error('OIDC state mismatch');
    }
    const verifier = sessionStorage.getItem(VERIFIER_KEY);
    if (!verifier) {
      throw new Error('Missing authorization verifier');
    }

    const body = new URLSearchParams();
    body.set('grant_type', 'authorization_code');
    body.set('code', code);
    body.set('redirect_uri', this.config.oidcRedirectUri);
    body.set('client_id', this.config.oidcClientId);
    body.set('code_verifier', verifier);

    const tokens = await firstValueFrom(
      this.http.post<TokenResponse>(`${this.config.oidcAuthority}/connect/token`, body),
    );

    this.accessToken.set(tokens.access_token);
    sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    sessionStorage.removeItem(VERIFIER_KEY);
    sessionStorage.removeItem(STATE_KEY);
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  isAuthenticated(): boolean {
    return this.accessToken() !== null;
  }

  readonly roles = this.rolesSignal.asReadonly();

  hasRole(role: string): boolean {
    return this.rolesSignal().includes(role);
  }

  setRoles(roles: readonly string[]): void {
    this.rolesSignal.set(roles);
  }

  setRolesForTest(roles: readonly string[]): void {
    this.rolesSignal.set(roles);
  }

  clearLocalSession(): void {
    this.accessToken.set(null);
    this.rolesSignal.set([]);
  }

  signOut(): void {
    this.accessToken.set(null);
    sessionStorage.removeItem(VERIFIER_KEY);
    sessionStorage.removeItem(STATE_KEY);
    sessionStorage.removeItem(RETURN_URL_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);

    const url = new URL('/connect/endsession', this.config.oidcAuthority);
    url.searchParams.set('client_id', this.config.oidcClientId);
    url.searchParams.set('post_logout_redirect_uri', this.config.oidcPostLogoutRedirectUri);

    this.redirect(url.toString());
  }

  setAccessTokenForTest(token: string | null): void {
    this.accessToken.set(token);
  }

  consumeReturnUrl(): string | null {
    const url = sessionStorage.getItem(RETURN_URL_KEY);
    if (url) {
      sessionStorage.removeItem(RETURN_URL_KEY);
    }
    return url;
  }

  setReturnUrl(url: string | null): void {
    if (url) {
      sessionStorage.setItem(RETURN_URL_KEY, url);
    } else {
      sessionStorage.removeItem(RETURN_URL_KEY);
    }
  }
}

function readPersistedAccessToken(): string | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

function randomBase64Url(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function createAuthorizationChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64Url(new Uint8Array(hash));
}

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
