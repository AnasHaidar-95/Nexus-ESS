/**
 * Standardized API Response Utilities
 * Strictly aligns with Part 4, Section 4.4 & 4.5 of the ESS API Specification.
 */

export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (
  res,
  message = 'Internal Server Error',
  statusCode = 500,
  code = 'INTERNAL_SERVER_ERROR',
  errors = null,
) => {
  const errorPayload = { code };

  if (errors) {
    // Strictly align with API Spec Section 4.5 for Validation Errors
    // If it's an array of field errors, map to 'fields', otherwise use 'details'
    if (Array.isArray(errors) && errors.length > 0 && errors[0].field !== undefined) {
      errorPayload.fields = errors;
    } else {
      errorPayload.details = errors;
    }
  }

  return res.status(statusCode).json({
    success: false,
    message,
    error: errorPayload,
    timestamp: new Date().toISOString(),
  });
};
