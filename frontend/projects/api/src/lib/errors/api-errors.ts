export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly correlationId: string | null,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    correlationId: string | null,
    readonly fieldErrors: Readonly<Record<string, readonly string[]>> = {},
  ) {
    super(message, 400, correlationId);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string, correlationId: string | null) {
    super(message, 401, correlationId);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string, correlationId: string | null) {
    super(message, 403, correlationId);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string, correlationId: string | null) {
    super(message, 404, correlationId);
  }
}

export class ServerError extends ApiError {
  constructor(message: string, correlationId: string | null, status = 500) {
    super(message, status, correlationId);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, correlationId: string | null) {
    super(message, 409, correlationId);
  }
}

interface HttpLikeError {
  readonly status: number;
  readonly headers: { get(name: string): string | null };
  readonly error: { title?: string; errors?: Record<string, readonly string[]> } | null;
}

export function fromHttpErrorResponse(response: HttpLikeError): ApiError {
  const correlationId = response.headers.get('X-Correlation-Id');
  const message = response.error?.title ?? `HTTP ${response.status}`;
  switch (response.status) {
    case 400:
      return new ValidationError(message, correlationId, response.error?.errors ?? {});
    case 401:
      return new UnauthorizedError(message, correlationId);
    case 403:
      return new ForbiddenError(message, correlationId);
    case 404:
      return new NotFoundError(message, correlationId);
    case 409:
      return new ConflictError(message, correlationId);
    default:
      return new ServerError(message, correlationId, response.status);
  }
}
