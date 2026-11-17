const Consultation = require('../models/Consultation');
const MedicalRecord = require('../models/MedicalRecord');

/**
 * Initiate Prescription Handoff to Module 3 (Prescription Management)
 */
const initiatePrescriptionHandoff = async (req, res, next) => {
  try {
    const { consultationId, handoffNotes = '' } = req.body;

    if (!consultationId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CONSULTATION_ID_REQUIRED',
          message: 'consultationId is required to initiate prescription handoff.',
        },
      });
    }

    const consultation = await Consultation.findById(consultationId)
      .populate('patientId', 'patientId universityId firstName lastName dateOfBirth gender bloodGroup')
      .populate('doctorId', 'title firstName lastName specialization medicalLicenseNumber');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONSULTATION_NOT_FOUND',
          message: `Consultation with ID ${consultationId} not found.`,
        },
      });
    }

    // Verify consultation has at least one recorded diagnosis
    if (!consultation.diagnoses || consultation.diagnoses.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DIAGNOSIS_REQUIRED_FOR_PRESCRIPTION',
          message: 'A consultation must have at least one recorded diagnosis before prescription handoff.',
        },
      });
    }

    // Retrieve patient allergies for prescription contraindication checking
    const medicalRecord = await MedicalRecord.findOne({ patientId: consultation.patientId._id }).lean();
    const knownAllergies = medicalRecord ? medicalRecord.knownAllergies : [];

    // Mark handoff initiated on the consultation document
    consultation.prescriptionHandoff = {
      initiated: true,
      initiatedAt: new Date(),
      handoffNotes,
      status: 'pending_rx_creation',
    };

    consultation.auditTrail.push({
      modifiedBy: req.user._id,
      modifiedByName: `${req.user.title || 'Dr.'} ${req.user.firstName} ${req.user.lastName}`,
      modifiedAt: new Date(),
      reasonForChange: 'Prescription handoff initiated to Prescription Management module.',
      changesSummary: 'Handoff status changed to pending_rx_creation.',
    });

    await consultation.save();

    // Standardized handoff payload for Developer 2 (Prescription Management)
    const handoffPayload = {
      consultationId: consultation._id,
      consultationNumber: consultation.consultationNumber,
      consultationDate: consultation.consultationDate,
      patient: {
        _id: consultation.patientId._id,
        patientId: consultation.patientId.patientId,
        universityId: consultation.patientId.universityId,
        fullName: `${consultation.patientId.firstName} ${consultation.patientId.lastName}`,
        dateOfBirth: consultation.patientId.dateOfBirth,
        gender: consultation.patientId.gender,
        bloodGroup: consultation.patientId.bloodGroup,
      },
      doctor: {
        _id: consultation.doctorId._id,
        fullName: `${consultation.doctorId.title || 'Dr.'} ${consultation.doctorId.firstName} ${consultation.doctorId.lastName}`,
        specialization: consultation.doctorId.specialization,
        licenseNumber: consultation.doctorId.medicalLicenseNumber,
      },
      diagnoses: consultation.diagnoses.map((d) => ({
        diagnosisName: d.diagnosisName,
        diagnosisCode: d.diagnosisCode,
        diagnosisType: d.diagnosisType,
        severity: d.severity,
      })),
      patientAllergies: knownAllergies.map((a) => ({
        allergen: a.allergen,
        category: a.category,
        reaction: a.reaction,
        severity: a.severity,
      })),
      vitalSigns: consultation.vitalSigns,
      clinicalObservationsSummary: consultation.clinicalObservations,
      handoffNotes,
      redirectUrl: `/prescriptions/new?consultationId=${consultation._id}&patientId=${consultation.patientId._id}`,
    };

    return res.status(200).json({
      success: true,
      message: 'Prescription workflow initiated successfully. Handoff context ready for Prescription Module.',
      data: handoffPayload,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check handoff and prescription status for a consultation
 */
const getHandoffStatus = async (req, res, next) => {
  try {
    const { consultationId } = req.params;
    const consultation = await Consultation.findById(consultationId)
      .select('consultationNumber prescriptionHandoff status')
      .populate('prescriptionHandoff.prescriptionId');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONSULTATION_NOT_FOUND',
          message: `Consultation with ID ${consultationId} not found.`,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        consultationId: consultation._id,
        consultationNumber: consultation.consultationNumber,
        prescriptionHandoff: consultation.prescriptionHandoff,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiatePrescriptionHandoff,
  getHandoffStatus,
};

