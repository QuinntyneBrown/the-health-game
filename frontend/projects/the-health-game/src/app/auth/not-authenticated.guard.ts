import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { AuthService } from 'api';

export const notAuthenticatedGuard: CanMatchFn = (): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) {
    return router.parseUrl('/home');
  }
  return true;
};
