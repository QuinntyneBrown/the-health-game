import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { ACCESS_TOKEN_KEY, RETURN_URL_KEY, STATE_KEY, VERIFIER_KEY } from '../auth/auth.service';
import { AUTH_SERVICE } from '../auth/auth.service.contract';
import { fromHttpErrorResponse } from './api-errors';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AUTH_SERVICE);
  const isSignInRequest = req.url.includes('/api/auth/sign-in');
  return next(req).pipe(
    catchError((response: unknown) => {
      if (
        !isSignInRequest &&
        response instanceof HttpErrorResponse &&
        response.status === 401
      ) {
        auth.clearLocalSession();
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem(ACCESS_TOKEN_KEY);
          sessionStorage.removeItem(VERIFIER_KEY);
          sessionStorage.removeItem(STATE_KEY);
          sessionStorage.removeItem(RETURN_URL_KEY);
        }
        void router.navigateByUrl('/onboarding');
      }
      return throwError(() =>
        response instanceof HttpErrorResponse ? fromHttpErrorResponse(response) : response,
      );
    }),
  );
};
