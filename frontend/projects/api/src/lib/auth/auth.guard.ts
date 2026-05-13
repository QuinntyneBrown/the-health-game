import { inject } from '@angular/core';
import { CanMatchFn, UrlSegment } from '@angular/router';

import { AUTH_SERVICE } from './auth.service.contract';

export const authGuard: CanMatchFn = (_route, segments: UrlSegment[]) => {
  const auth = inject(AUTH_SERVICE);
  if (auth.isAuthenticated()) {
    return true;
  }
  const target = '/' + segments.map((s) => s.path).join('/');
  void auth.signIn(target);
  return false;
};
