// Acceptance Test
// Traces to: L2-016, L2-022
// Description: errorInterceptor catches HttpErrorResponse and rethrows typed ApiError.
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { API_CONFIG } from '../api.config';
import { AuthService } from '../auth/auth.service';
import { AUTH_SERVICE } from '../auth/auth.service.contract';

import {
  ApiError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  ValidationError,
} from './api-errors';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: API_CONFIG,
          useValue: {
            apiBaseUrl: '',
            oidcAuthority: '',
            oidcClientId: '',
            oidcScopes: [],
            oidcRedirectUri: '',
            oidcPostLogoutRedirectUri: '',
          },
        },
        { provide: AUTH_SERVICE, useExisting: AuthService },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  async function expectError(status: number, body: object): Promise<ApiError> {
    const promise = firstValueFrom(http.get('/api/probe'));
    const req = controller.expectOne('/api/probe');
    req.flush(body, {
      status,
      statusText: 'X',
      headers: { 'X-Correlation-Id': `cid-${status}` },
    });
    try {
      await promise;
    } catch (e) {
      return e as ApiError;
    }
    throw new Error('expected error');
  }

  it('maps 400 with field errors to ValidationError', async () => {
    const err = await expectError(400, { errors: { name: ['Required'] } });
    expect(err).toBeInstanceOf(ValidationError);
    expect((err as ValidationError).fieldErrors).toEqual({ name: ['Required'] });
    expect(err.correlationId).toBe('cid-400');
  });

  it('maps 403 to ForbiddenError', async () => {
    expect(await expectError(403, {})).toBeInstanceOf(ForbiddenError);
  });

  it('maps 404 to NotFoundError', async () => {
    expect(await expectError(404, {})).toBeInstanceOf(NotFoundError);
  });

  it('maps 500 to ServerError', async () => {
    expect(await expectError(500, {})).toBeInstanceOf(ServerError);
  });
});
