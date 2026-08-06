/**
 * Role-Based Access Control (RBAC) Middleware Enforcer
 * Grants access only if user role matches one of allowed roles:
 * ('RESIDENT', 'SOCIETY_ADMIN', 'NGO', 'FACTORY')
 * 
 * @param  {...string} roles - Allowed user roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required prior to authorization check.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required role(s): ${roles.join(', ')}`,
      });
    }

    next();
  };
};
