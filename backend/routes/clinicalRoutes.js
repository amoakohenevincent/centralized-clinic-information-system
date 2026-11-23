const express = require('express');
const { query } = require('express-validator');
const router = express.Router();

const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  getDashboardStats,
  getAppointmentQueue,
  searchPatients,
} = require('../controllers/clinicalDashboardController');

// All clinical routes require valid authentication
router.use(authenticateToken);

/**
 * @route   GET /api/clinical/dashboard/stats
 * @desc    Get aggregate metrics for doctor dashboard
 * @access  Doctor, Nurse, Admin
 */
router.get('/dashboard/stats', authorizeRoles('doctor', 'nurse', 'admin'), getDashboardStats);

/**
 * @route   GET /api/clinical/dashboard/queue
 * @desc    Get triage appointment queue (today's awaiting & completed)
 * @access  Doctor, Nurse
 */
router.get(
  '/dashboard/queue',
  authorizeRoles('doctor', 'nurse'),
  [
    query('status').optional().isIn(['all', 'scheduled', 'checked-in', 'in-consultation', 'completed', 'cancelled']),
    query('date').optional().isISO8601().withMessage('Date must be in valid YYYY-MM-DD format'),
    validate,
  ],
  getAppointmentQueue
);

/**
 * @route   GET /api/clinical/patients/search
 * @desc    Search registered patients by ID, Name, or Student/Staff ID
 * @access  Doctor, Nurse, Admin
 */
router.get(
  '/patients/search',
  authorizeRoles('doctor', 'nurse', 'admin'),
  [
    query('query').optional().trim(),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate,
  ],
  searchPatients
);

module.exports = router;

