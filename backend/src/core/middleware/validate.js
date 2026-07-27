import { ZodError } from 'zod';
import { sendError } from '../utils/api-response.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsedData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (parsedData.body) {
      req.body = parsedData.body;
    }
    if (parsedData.params) {
      req.params = parsedData.params;
    }
    if (parsedData.query) {
      Object.defineProperty(req, 'query', {
        value: parsedData.query,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errorDetails = error.issues.map((issue) => ({
        field: issue.path.join('.') || 'root',
        message: issue.message,
      }));
      return sendError(res, 'Validation failed', 422, 'VALIDATION_ERROR', errorDetails);
    }
    next(error);
  }
};
