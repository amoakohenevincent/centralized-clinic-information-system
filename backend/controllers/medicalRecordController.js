const medicalRecordService = require('../services/medicalRecordService');

/**
 * Retrieve patient longitudinal medical history
 */
const getPatientMedicalHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const history = await medicalRecordService.getPatientMedicalHistory(patientId);

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update baseline medical record indicators (Allergies, chronic conditions, blood group)
 */
const updatePatientSummary = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const doctorUser = req.user;

    const updated = await medicalRecordService.updatePatientSummary(patientId, req.body, doctorUser);

    return res.status(200).json({
      success: true,
      message: 'Patient baseline medical record summary updated.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientMedicalHistory,
  updatePatientSummary,
};

