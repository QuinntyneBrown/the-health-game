import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { fromHttpErrorResponse } from './api-errors';

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((response: unknown) =>
      throwError(() =>
        response instanceof HttpErrorResponse ? fromHttpErrorResponse(response) : response,
      ),
    ),
  );
