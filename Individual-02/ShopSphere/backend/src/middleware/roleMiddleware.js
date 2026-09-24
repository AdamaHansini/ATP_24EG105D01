// backend/src/middleware/roleMiddleware.js
export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        errorCode: 'UNAUTHENTICATED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' does not have permission for this resource. Required: ${allowedRoles.join(', ')}`,
        errorCode: 'FORBIDDEN_ROLE',
      });
    }

    next();
  };
}
