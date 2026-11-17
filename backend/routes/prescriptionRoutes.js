const express = require('express');
const router = express.Router();

const prescriptionController = require('../controllers/prescriptionController');
const authenticate = require('../middleware/auth');
const { isDoctor, isPharmacist, isClinicalStaff } = require('../middleware/roleCheck');
const {
  validateCreatePrescription,
  validateUpdatePrescription,
  validateDispenseStatus
} = require('../middleware/validateRequest');

// All prescription routes require shared CCIS authentication
router.use(authenticate);

// 1. Dashboard summary metrics
router.get('/dashboard-stats', isClinicalStaff, prescriptionController.getDashboardStats);

// 2. Patient-specific clinical prescription history
router.get('/patient/:patientId', isClinicalStaff, prescriptionController.getPatientPrescriptionHistory);

// 3. Main collection routes: List & Create
router
  .route('/')
  .get(isClinicalStaff, prescriptionController.getAllPrescriptions)
  .post(isDoctor, validateCreatePrescription, prescriptionController.createPrescription);

// 4. Single prescription resource routes: Get, Update, Cancel
router
  .route('/:id')
  .get(isClinicalStaff, prescriptionController.getPrescriptionById)
  .put(isDoctor, validateUpdatePrescription, prescriptionController.updatePrescription);

router.patch('/:id/cancel', isDoctor, prescriptionController.cancelPrescription);

// 5. Pharmacy Handoff Integration endpoint (Madam Sarah / Module 4)
router.patch(
  '/:id/dispense-status',
  isPharmacist,
  validateDispenseStatus,
  prescriptionController.updateDispenseStatus
);

module.exports = router;
