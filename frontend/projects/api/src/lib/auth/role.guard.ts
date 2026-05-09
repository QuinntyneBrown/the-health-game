import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export function roleGuard(role: string): CanMatchFn {
  return () => {
    const auth = inject(AuthService);
    if (auth.hasRole(role)) {
      return true;
    }
    return inject(Router).parseUrl('/');
  };
}
