import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { AUTH_SERVICE } from './auth.service.contract';

export function roleGuard(role: string): CanMatchFn {
  return () => {
    const auth = inject(AUTH_SERVICE);
    if (auth.hasRole(role)) {
      return true;
    }
    return inject(Router).parseUrl('/');
  };
}
