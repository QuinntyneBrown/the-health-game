import { InjectionToken, Signal } from '@angular/core';

export interface SignInOptions {
  readonly prompt?: 'login' | 'none';
}

export interface IAuthService {
  readonly roles: Signal<readonly string[]>;
  signIn(returnUrl?: string, options?: SignInOptions): Promise<void>;
  signInWithPassword(usernameOrEmail: string, password: string): Promise<void>;
  handleRedirect(code: string, state: string): Promise<void>;
  getAccessToken(): string | null;
  isAuthenticated(): boolean;
  hasRole(role: string): boolean;
  setRoles(roles: readonly string[]): void;
  clearLocalSession(): void;
  signOut(): void;
  consumeReturnUrl(): string | null;
  setReturnUrl(url: string | null): void;
}

export const AUTH_SERVICE = new InjectionToken<IAuthService>('AUTH_SERVICE');
