// Typed application error. Presentation (respond.ts, added in Phase 4) maps code+status to HTTP.
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'AppError';
  }
}

export const unauthorized = (m?: string) => new AppError('unauthorized', 401, m);
export const forbidden = (m?: string) => new AppError('forbidden', 403, m);
export const notFound = (m?: string) => new AppError('not_found', 404, m);
export const badRequest = (m?: string) => new AppError('bad_request', 400, m);
export const badGateway = (m?: string) => new AppError('bad_gateway', 502, m);
export const tooManyRequests = (m?: string) => new AppError('too_many_requests', 429, m);
