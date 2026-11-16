const { ApiError } = require("../errors");

function requireRole(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return next(new ApiError(401, "UNAUTHENTICATED", "Sign-in is required."));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "FORBIDDEN", "You do not have permission to perform this action."));
    }

    return next();
  };
}

module.exports = { requireRole };
