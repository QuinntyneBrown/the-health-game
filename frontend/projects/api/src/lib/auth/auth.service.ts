import { Injectable, InjectionToken, inject } from '@angular/core';

import { API_CONFIG } from '../api.config';

export const VERIFIER_KEY = 'hg.oidc.verifier';
export const STATE_KEY = 'hg.oidc.state';
export const RETURN_URL_KEY = 'hg.oidc.return-url';

export type Redirector = (url: string) => void;

export const OIDC_REDIRECTOR = new InjectionToken<Redirector>('OIDC_REDIRECTOR', {
  providedIn: 'root',
  factory: () => (url: string) => window.location.assign(url),
});

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly config = inject(API_CONFIG);
  private readonly redirect = inject(OIDC_REDIRECTOR);

  async signIn(returnUrl?: string): Promise<void> {
    const verifier = randomBase64Url(32);
    const state = randomBase64Url(16);
    sessionStorage.setItem(VERIFIER_KEY, verifier);
    sessionStorage.setItem(STATE_KEY, state);
    if (returnUrl) {
      sessionStorage.setItem(RETURN_URL_KEY, returnUrl);
    }

    const challenge = await pkceChallenge(verifier);

    const url = new URL('/connect/authorize', this.config.oidcAuthority);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.config.oidcClientId);
    url.searchParams.set('redirect_uri', this.config.oidcRedirectUri);
    url.searchParams.set('scope', this.config.oidcScopes);
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('code_challenge_method', 'S256');

    this.redirect(url.toString());
  }
}

function randomBase64Url(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function pkceChallenge(verifier: string): Promise<string> {
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
