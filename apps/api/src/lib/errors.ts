export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function badRequest(message: string): AppError {
  return new AppError(400, 'bad_request', message);
}

export function notFound(message = 'Not found'): AppError {
  return new AppError(404, 'not_found', message);
}

export function conflict(message: string): AppError {
  return new AppError(409, 'conflict', message);
}
