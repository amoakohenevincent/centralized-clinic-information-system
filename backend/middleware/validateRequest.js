const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Intercepts express-validator results and returns standard 400 response if validation fails
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the highlighted errors.',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next;
  next();
};

/**
 * Validation rules for creating a prescription
 */
const validateCreatePrescription = [
  body('patientId')
    .notEmpty()
    .withMessage('Patient ID is required')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Patient ID must be a valid MongoDB ObjectId'),

  body('consultationId')
    .optional({ nullable: true })
    .custom((val) => !val || mongoose.Types.ObjectId.isValid(val))
    .withMessage('Consultation ID must be a valid MongoDB ObjectId if provided'),

  body('clinicalDiagnosis')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Clinical diagnosis must not exceed 500 characters'),

  body('generalInstructions')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('General instructions must not exceed 1000 characters'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('A prescription must contain at least one medication item'),

  body('items.*.medicineId')
    .notEmpty()
    .withMessage('Medicine ID is required for each item')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Medicine ID must be a valid MongoDB ObjectId'),

  body('items.*.medicineName')
    .notEmpty()
    .withMessage('Medicine name is required')
    .trim(),

  body('items.*.strength')
    .notEmpty()
    .withMessage('Medicine strength is required (e.g., 500mg)')
    .trim(),

  body('items.*.form')
    .notEmpty()
    .withMessage('Dosage form is required')
    .isIn(['Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Inhaler', 'Ointment', 'Drops', 'Other'])
    .withMessage('Invalid dosage form specified'),

  body('items.*.dosage')
    .notEmpty()
    .withMessage('Dosage instruction is required (e.g., 1 tablet)')
    .trim(),

  body('items.*.frequency')
    .notEmpty()
    .withMessage('Frequency is required')
    .isIn([
      'Once daily (OD)',
      'Twice daily (BD)',
      'Three times daily (TDS)',
      'Four times daily (QDS)',
      'Every 4 hours (q4h)',
      'Every 6 hours (q6h)',
      'Every 8 hours (q8h)',
      'As needed / PRN',
      'Stat / Immediate single dose',
      'At bedtime (ON)'
    ])
    .withMessage('Invalid frequency frequency option provided'),

  body('items.*.duration')
    .notEmpty()
    .withMessage('Duration is required (e.g., 5 days)')
    .trim(),

  body('items.*.quantityPrescribed')
    .notEmpty()
    .withMessage('Quantity prescribed is required')
    .isInt({ min: 1 })
    .withMessage('Quantity prescribed must be an integer greater than or equal to 1'),

  body('items.*.instructions')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Item instructions must not exceed 300 characters'),

  handleValidationErrors
];

/**
 * Validation rules for updating a prescription before dispensing
 */
const validateUpdatePrescription = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid prescription ID format'),

  body('reason')
    .notEmpty()
    .withMessage('A clinical reason for prescription modification is required for audit tracking')
    .isLength({ min: 5, max: 300 })
    .withMessage('Reason must be between 5 and 300 characters'),

  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('If updating items, at least one medication item must be provided'),

  body('items.*.medicineId')
    .optional()
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Medicine ID must be a valid MongoDB ObjectId'),

  body('items.*.quantityPrescribed')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity prescribed must be an integer greater than or equal to 1'),

  handleValidationErrors
];

/**
 * Validation rules for Pharmacy Dispensing Status Handoff
 */
const validateDispenseStatus = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid prescription ID format'),

  body('status')
    .notEmpty()
    .withMessage('Overall dispensing status is required')
    .isIn(['partially_dispensed', 'fulfilled', 'pending_backorder'])
    .withMessage('Status must be one of: partially_dispensed, fulfilled, pending_backorder'),

  body('dispensingNotes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Dispensing notes must not exceed 500 characters'),

  body('itemsDispensed')
    .isArray({ min: 1 })
    .withMessage('itemsDispensed array is required when recording dispensing actions'),

  body('itemsDispensed.*.medicineId')
    .notEmpty()
    .withMessage('Medicine ID is required for each dispensed item')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Medicine ID must be a valid MongoDB ObjectId'),

  body('itemsDispensed.*.quantityDispensed')
    .notEmpty()
    .isInt({ min: 0 })
    .withMessage('Quantity dispensed must be a non-negative integer'),

  handleValidationErrors
];

module.exports = {
  validateCreatePrescription,
  validateUpdatePrescription,
  validateDispenseStatus
};
