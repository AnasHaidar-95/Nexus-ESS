import { AppError } from '../errors/app-error.js';
import { sendError } from '../utils/api-response.js';
import { logger } from '../utils/logger.js';
import { config } from '../../config/index.js';

// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    code: err.code || err.name,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'Invalid JSON format in request body.', 400, 'INVALID_JSON');
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 'File size exceeds the maximum allowed limit.', 400, 'FILE_TOO_LARGE');
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return sendError(res, 'Unexpected file field.', 400, 'INVALID_FILE_FIELD');
  }

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.code);
  }

  if (err.code === 'P2002') {
    const target = err.meta?.target ? err.meta.target.join(', ') : 'unknown field';
    return sendError(res, `Unique constraint violation on ${target}`, 409, 'DUPLICATE_RESOURCE');
  }
  if (err.code === 'P2025') {
    return sendError(res, 'Record not found.', 404, 'RESOURCE_NOT_FOUND');
  }
  if (err.code === 'P2003') {
    const field = err.meta?.field_name || 'unknown field';
    return sendError(
      res,
      `Foreign key constraint failed on ${field}.`,
      400,
      'FOREIGN_KEY_VIOLATION',
    );
  }
  if (err.name === 'PrismaClientValidationError') {
    return sendError(
      res,
      config.isDev ? `Database validation failed: ${err.message}` : 'Database validation failed.',
      400,
      'DATABASE_VALIDATION_ERROR',
    );
  }

  return sendError(
    res,
    config.isDev ? err.message : 'An unexpected error occurred.',
    500,
    'INTERNAL_SERVER_ERROR',
  );
};
