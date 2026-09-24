// backend/src/utils/responseFormatter.js
export function successResponse(res, message = 'Operation successful', data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(res, message = 'Something went wrong', errorCode = 'INTERNAL_ERROR', statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
  });
}
