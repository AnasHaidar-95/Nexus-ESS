export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'RESOURCE_NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required.', code = 'AUTHENTICATION_REQUIRED') {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions.') {
    super(message, 403, 'INSUFFICIENT_PERMISSIONS');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict.') {
    super(message, 409, 'DUPLICATE_RESOURCE');
  }
}
