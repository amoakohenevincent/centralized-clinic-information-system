const express = require('express');
const router = express.Router();

const clinicalRoutes = require('./clinicalRoutes');
const consultationRoutes = require('./consultationRoutes');
const medicalRecordRoutes = require('./medicalRecordRoutes');
const prescriptionHandoffRoutes = require('./prescriptionHandoffRoutes');

// Mount module sub-routers
router.use('/clinical', clinicalRoutes);
router.use('/consultations', consultationRoutes);
router.use('/medical-records', medicalRecordRoutes);
router.use('/clinical/prescription-handoff', prescriptionHandoffRoutes);

module.exports = router;

