const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  initiatePrescriptionHandoff,
  getHandoffStatus,
} = require('../controllers/prescriptionHandoffController');

router.use(authenticateToken);

/**
 * @route   POST /api/clinical/prescription-handoff
 * @desc    Initiate prescription workflow for a completed consultation
 * @access  Doctor
 */
router.post(
  '/',
  authorizeRoles('doctor'),
  [
    body('consultationId')
      .notEmpty()
      .withMessage('Consultation ID is required')
      .isMongoId()
      .withMessage('Invalid Consultation ID format'),
    validate,
  ],
  initiatePrescriptionHandoff
);

/**
 * @route   GET /api/clinical/prescription-handoff/:consultationId/status
 * @desc    Check prescription handoff status
 * @access  Doctor, Nurse, Admin
 */
router.get(
  '/:consultationId/status',
  authorizeRoles('doctor', 'nurse', 'admin'),
  [param('consultationId').isMongoId().withMessage('Invalid Consultation ID format'), validate],
  getHandoffStatus
);

module.exports = router;

