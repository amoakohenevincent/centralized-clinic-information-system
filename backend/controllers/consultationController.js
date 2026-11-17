const consultationService = require('../services/consultationService');

/**
 * Record a new clinical consultation
 */
const createConsultation = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const consultation = await consultationService.createConsultation(req.body, doctorId);

    return res.status(201).json({
      success: true,
      message: 'Clinical consultation recorded successfully.',
      data: consultation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve consultation by ID
 */
const getConsultationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const consultation = await consultationService.getConsultationById(id);

    return res.status(200).json({
      success: true,
      data: consultation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve chronological consultation history for a patient
 */
const getPatientConsultationHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { page, limit, sort } = req.query;

    const result = await consultationService.getPatientConsultationHistory(patientId, { page, limit, sort });

    return res.status(200).json({
      success: true,
      data: result.consultations,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlled amendment to an existing clinical record
 */
const updateConsultation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reasonForChange, ...updateData } = req.body;
    const doctorUser = req.user;

    const updated = await consultationService.updateConsultation(id, updateData, doctorUser, reasonForChange);

    return res.status(200).json({
      success: true,
      message: 'Clinical record amended successfully with traceable audit entry.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record diagnosis details for an existing consultation session without data loss
 */
const recordDiagnosis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctorUser = req.user;

    const updated = await consultationService.recordDiagnosis(id, req.body, doctorUser);

    return res.status(200).json({
      success: true,
      message: 'Diagnosis recorded successfully and appended to consultation.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createConsultation,
  getConsultationById,
  getPatientConsultationHistory,
  updateConsultation,
  recordDiagnosis,
};

