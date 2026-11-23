const express = require('express');
const router = express.Router();

// Module 2: Clinical Records routes (your code)
const clinicalRoutes = require('./clinicalRoutes');
const consultationRoutes = require('./consultationRoutes');
const medicalRecordRoutes = require('./medicalRecordRoutes');
const prescriptionHandoffRoutes = require('./prescriptionHandoffRoutes');

// Module 3: Prescription Management routes (team member's code)
const prescriptionRoutes = require('./prescriptionRoutes');

// Module 1: Patient & Appointment routes (from main branch)
const patientRoutes = require('../src/routes/patientRoutes');
const appointmentRoutes = require('../src/routes/appointmentRoutes');

// ─── Module 1: Patient & Appointment Management ───
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);

// ─── Module 2: Clinical Records Management ───
router.use('/clinical', clinicalRoutes);
router.use('/consultations', consultationRoutes);
router.use('/medical-records', medicalRecordRoutes);
router.use('/clinical/prescription-handoff', prescriptionHandoffRoutes);

// ─── Module 3: Prescription Management ───
router.use('/prescriptions', prescriptionRoutes);

module.exports = router;
