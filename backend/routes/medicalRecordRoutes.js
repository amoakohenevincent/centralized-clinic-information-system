const express = require('express');
const { param, body } = require('express-validator');
const router = express.Router();

const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  getPatientMedicalHistory,
  updatePatientSummary,
} = require('../controllers/medicalRecordController');

router.use(authenticateToken);

/**
 * @route   GET /api/medical-records/patient/:patientId
 * @desc    Get longitudinal medical record, consultation history, past diagnoses and previous prescriptions
 * @access  Doctor, Nurse, Admin
 */
router.get(
  '/patient/:patientId',
  authorizeRoles('doctor', 'nurse', 'admin'),
  [param('patientId').isMongoId().withMessage('Invalid patient ID format'), validate],
  getPatientMedicalHistory
);

/**
 * @route   PUT /api/medical-records/patient/:patientId/summary
 * @desc    Update baseline medical record profile (allergies, chronic illnesses, blood group)
 * @access  Doctor, Nurse
 */
router.put(
  '/patient/:patientId/summary',
  authorizeRoles('doctor', 'nurse'),
  [
    param('patientId').isMongoId().withMessage('Invalid patient ID format'),
    body('bloodGroup')
      .optional()
      .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'])
      .withMessage('Invalid blood group'),
    validate,
  ],
  updatePatientSummary
);

module.exports = router;

