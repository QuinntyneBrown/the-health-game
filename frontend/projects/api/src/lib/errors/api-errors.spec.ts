// Acceptance Test
// Traces to: L2-016
// Description: Typed API errors expose status, message, and X-Correlation-Id.
import {
  ApiError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  ValidationError,
  fromHttpErrorResponse,
} from './api-errors';

describe('typed API errors', () => {
  it('NotFoundError has status 404 and is an ApiError', () => {
    const err = new NotFoundError('missing', 'cid-1');
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(404);
    expect(err.correlationId).toBe('cid-1');
  });

  it('ForbiddenError has status 403', () => {
    expect(new ForbiddenError('nope', 'cid-2').status).toBe(403);
  });

  it('ValidationError carries field errors', () => {
    const err = new ValidationError('invalid', 'cid-3', { name: ['Required'] });
    expect(err.status).toBe(400);
    expect(err.fieldErrors).toEqual({ name: ['Required'] });
  });

  it('ServerError has status 500', () => {
    expect(new ServerError('boom', 'cid-4').status).toBe(500);
  });
});

describe('fromHttpErrorResponse', () => {
  it('maps 400 ProblemDetails with field errors to ValidationError', () => {
    const err = fromHttpErrorResponse({
      status: 400,
      headers: { get: () => 'cid-a' },
      error: { title: 'Invalid', errors: { name: ['Required'] } },
    });
    expect(err).toBeInstanceOf(ValidationError);
    expect((err as ValidationError).fieldErrors).toEqual({ name: ['Required'] });
    expect(err.correlationId).toBe('cid-a');
  });

  it('maps 403 to ForbiddenError', () => {
    const err = fromHttpErrorResponse({ status: 403, headers: { get: () => null }, error: {} });
    expect(err).toBeInstanceOf(ForbiddenError);
  });

  it('maps 404 to NotFoundError', () => {
    const err = fromHttpErrorResponse({ status: 404, headers: { get: () => null }, error: {} });
    expect(err).toBeInstanceOf(NotFoundError);
  });

  it('maps 500 to ServerError', () => {
    const err = fromHttpErrorResponse({ status: 500, headers: { get: () => null }, error: {} });
    expect(err).toBeInstanceOf(ServerError);
  });
});
