/**
 * Role-Based Access Control (RBAC) middleware for CCIS.
 * Enforces role restrictions according to clinical security requirements.
 */

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. User role not identified.'
      });
    }

    const userRole = req.user.role.toLowerCase();
    const hasRole = allowedRoles.some((role) => role.toLowerCase() === userRole);

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Action requires one of the following roles: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

// Convenience role helpers
const isDoctor = requireRole('doctor');
const isPharmacist = requireRole('pharmacist');
const isClinicalStaff = requireRole('doctor', 'pharmacist', 'nurse', 'admin');

module.exports = {
  requireRole,
  isDoctor,
  isPharmacist,
  isClinicalStaff
};
