import { inject } from '@angular/core';
import { CanMatchFn, UrlSegment } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanMatchFn = (_route, segments: UrlSegment[]) => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) {
    return true;
  }
  const target = '/' + segments.map((s) => s.path).join('/');
  void auth.signIn(target);
  return false;
};
