// backend/src/middleware/errorMiddleware.js
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  console.error(`[api] ${req.method} ${req.originalUrl} failed:`, err.name, err.code, err.message);

  let statusCode = Number(err.statusCode || err.status) || 500;
  let errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  if (err.name === 'ValidationError' || err.type === 'entity.parse.failed') {
    statusCode = 400;
    errorCode = err.name === 'ValidationError' ? 'VALIDATION_ERROR' : 'INVALID_JSON';
  } else if (err.name === 'CastError') {
    statusCode = 404;
    errorCode = 'RESOURCE_NOT_FOUND';
  } else if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_RESOURCE';
  }
  const message = statusCode >= 500 && !err.expose
    ? 'An unexpected server error occurred. Please try again.'
    : (err.message || 'The request could not be completed.');

  const responsePayload = {
    success: false,
    message,
    errorCode,
  };

  // Never expose stack traces or credentials to clients
  res.status(statusCode).json(responsePayload);
}
