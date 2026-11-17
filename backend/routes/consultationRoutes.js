const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createConsultation,
  getConsultationById,
  getPatientConsultationHistory,
  updateConsultation,
  recordDiagnosis,
} = require('../controllers/consultationController');

router.use(authenticateToken);

/**
 * @route   POST /api/consultations
 * @desc    Record and finalize a new clinical consultation
 * @access  Doctor
 */
router.post(
  '/',
  authorizeRoles('doctor'),
  [
    body('patientId')
      .notEmpty()
      .withMessage('Patient ID is required')
      .isMongoId()
      .withMessage('Invalid Patient ID format'),
    body('appointmentId')
      .notEmpty()
      .withMessage('Appointment ID is required')
      .isMongoId()
      .withMessage('Invalid Appointment ID format'),
    body('clinicalObservations')
      .trim()
      .notEmpty()
      .withMessage('Clinical observations or findings are required')
      .isLength({ min: 5 })
      .withMessage('Clinical observations must be at least 5 characters long'),
    body('diagnoses')
      .isArray({ min: 1 })
      .withMessage('At least one diagnosis is required to complete a consultation'),
    body('diagnoses.*.diagnosisName')
      .trim()
      .notEmpty()
      .withMessage('Each diagnosis must have a valid diagnosisName'),
    body('diagnoses.*.diagnosisType')
      .optional()
      .isIn(['primary', 'secondary', 'differential', 'provisional'])
      .withMessage('Invalid diagnosisType'),
    body('diagnoses.*.severity')
      .optional()
      .isIn(['mild', 'moderate', 'severe', 'critical'])
      .withMessage('Invalid diagnosis severity'),
    body('vitalSigns.temperature')
      .optional({ nullable: true })
      .isFloat({ min: 30.0, max: 45.0 })
      .withMessage('Temperature must be between 30°C and 45°C'),
    body('vitalSigns.heartRate')
      .optional({ nullable: true })
      .isInt({ min: 30, max: 250 })
      .withMessage('Heart rate must be between 30 and 250 bpm'),
    body('vitalSigns.oxygenSaturation')
      .optional({ nullable: true })
      .isInt({ min: 50, max: 100 })
      .withMessage('Oxygen saturation must be between 50% and 100%'),
    validate,
  ],
  createConsultation
);

/**
 * @route   GET /api/consultations/:id
 * @desc    Get detailed consultation record
 * @access  Doctor, Nurse, Admin
 */
router.get(
  '/:id',
  authorizeRoles('doctor', 'nurse', 'admin'),
  [param('id').isMongoId().withMessage('Invalid consultation ID format'), validate],
  getConsultationById
);

/**
 * @route   GET /api/consultations/patient/:patientId
 * @desc    Get chronological consultation history for a specific patient
 * @access  Doctor, Nurse, Admin
 */
router.get(
  '/patient/:patientId',
  authorizeRoles('doctor', 'nurse', 'admin'),
  [
    param('patientId').isMongoId().withMessage('Invalid patient ID format'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().isIn(['asc', 'desc']),
    validate,
  ],
  getPatientConsultationHistory
);

/**
 * @route   PUT /api/consultations/:id
 * @desc    Controlled amendment of clinical records with traceable audit trail
 * @access  Doctor
 */
router.put(
  '/:id',
  authorizeRoles('doctor'),
  [
    param('id').isMongoId().withMessage('Invalid consultation ID format'),
    body('reasonForChange')
      .trim()
      .notEmpty()
      .withMessage('An explicit reason for change is required to amend a clinical record')
      .isLength({ min: 5 })
      .withMessage('Reason for change must be at least 5 characters long'),
    validate,
  ],
  updateConsultation
);

/**
 * @route   PATCH /api/consultations/:id/diagnoses
 * @desc    Record or append diagnoses to a consultation session non-destructively
 * @access  Doctor
 */
router.patch(
  '/:id/diagnoses',
  authorizeRoles('doctor'),
  [
    param('id').isMongoId().withMessage('Invalid consultation ID format'),
    body('diagnosisName').trim().notEmpty().withMessage('Diagnosis name is required'),
    body('diagnosisType').optional().isIn(['primary', 'secondary', 'differential', 'provisional']),
    body('severity').optional().isIn(['mild', 'moderate', 'severe', 'critical']),
    validate,
  ],
  recordDiagnosis
);

module.exports = router;

