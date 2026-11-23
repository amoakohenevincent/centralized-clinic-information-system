const jwt = require('jsonwebtoken');
const User = require('../models/shared/User');

/**
 * Unified CCIS Authentication Middleware
 * Validates JWT Bearer tokens for all modules.
 * Populates req.user with { _id, id, username, role, firstName, lastName, email, title, name }.
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

    // Attach verified user info (compatible with all modules)
    req.user = {
      _id: userId,
      id: userId,
      username: decoded.username || decoded.email || 'user',
      role: decoded.role || 'doctor',
      firstName: decoded.firstName || 'Authorized',
      lastName: decoded.lastName || 'Staff',
      title: decoded.title || (decoded.role === 'doctor' ? 'Dr.' : ''),
      email: decoded.email || '',
      name: decoded.name || `${decoded.firstName || 'Authorized'} ${decoded.lastName || 'Staff'}`,
      specialization: decoded.specialization || 'General Practice',
      medicalLicenseNumber: decoded.medicalLicenseNumber || '',
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
          message: `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
          requiredRoles: allowedRoles,
        },
      });
    }

    next();
  };
};

/**
 * Module 1 compatible requireRole middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'Sign-in is required.' },
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action.' },
      });
    }
    return next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  requireRole,
};
