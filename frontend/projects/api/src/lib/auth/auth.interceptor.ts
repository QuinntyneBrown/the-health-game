import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_CONFIG } from '../api.config';
import { AUTH_SERVICE } from './auth.service.contract';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBaseUrl = inject(API_CONFIG).apiBaseUrl;
  const token = inject(AUTH_SERVICE).getAccessToken();
  if (!token || !req.url.startsWith(apiBaseUrl)) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
