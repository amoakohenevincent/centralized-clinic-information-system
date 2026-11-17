const jwt = require('jsonwebtoken');
const User = require('../models/shared/User');

/**
 * Authentication Middleware
 * Validates JWT token from the shared CCIS authentication system.
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Access denied. Valid Bearer authentication token required.',
        },
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'ccis_shared_jwt_secret_university_clinic_2026';

    const decoded = jwt.verify(token, secret);

    // If decoded payload has user ID, populate user context
    const userId = decoded.id || decoded.userId || decoded._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Malformed authentication token payload.',
        },
      });
    }

    // Attach verified user info
    req.user = {
      _id: userId,
      id: userId,
      username: decoded.username,
      role: decoded.role || 'doctor',
      firstName: decoded.firstName || 'Authorized',
      lastName: decoded.lastName || 'Staff',
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_EXPIRED',
          message: 'Session expired. Please log in again.',
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_UNAUTHORIZED',
        message: 'Invalid or forged authentication token.',
      },
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts route access to specified clinic roles.
 * E.g. authorizeRoles('doctor', 'admin')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_ROLE_MISSING',
          message: 'User role could not be identified.',
        },
      });
    }

    const userRole = req.user.role.toLowerCase();
    const hasRole = allowedRoles.map((r) => r.toLowerCase()).includes(userRole);

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
          message: `Access denied. Role '${req.user.role}' is not authorized to access this clinical resource.`,
          requiredRoles: allowedRoles,
        },
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};

