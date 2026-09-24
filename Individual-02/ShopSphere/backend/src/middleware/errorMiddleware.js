// backend/src/middleware/errorMiddleware.js
export function errorHandler(err, req, res, next) {
  console.error('[SERVER ERROR HANDLER]:', err.message);

  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred. Please try again.';

  const responsePayload = {
    success: false,
    message,
    errorCode,
  };

  if (err.auditSteps) {
    responsePayload.auditSteps = err.auditSteps;
  }

  // Never expose stack traces or credentials to clients
  res.status(statusCode).json(responsePayload);
}
