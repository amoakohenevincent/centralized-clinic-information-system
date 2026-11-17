const Consultation = require('../models/Consultation');
const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/shared/Patient');
const Appointment = require('../models/shared/Appointment');

class ConsultationService {
  /**
   * Create and record a new clinical consultation
   */
  async createConsultation(consultationData, doctorId) {
    const {
      patientId,
      appointmentId,
      consultationDate,
      vitalSigns,
      presentingComplaints,
      symptoms,
      clinicalObservations,
      diagnoses,
      doctorNotes,
      followUpRecommendations,
    } = consultationData;

    // Verify patient exists in shared patient collection
    const patient = await Patient.findById(patientId);
    if (!patient) {
      const error = new Error(`Patient with ID ${patientId} not found in clinic records.`);
      error.statusCode = 404;
      error.code = 'PATIENT_NOT_FOUND';
      throw error;
    }

    // Verify appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      const error = new Error(`Appointment with ID ${appointmentId} not found.`);
      error.statusCode = 404;
      error.code = 'APPOINTMENT_NOT_FOUND';
      throw error;
    }

    // Check if consultation already exists for this appointment to prevent duplicate entries
    const existingConsultation = await Consultation.findOne({ appointmentId });
    if (existingConsultation) {
      const error = new Error(`A consultation record already exists for appointment ${appointmentId}.`);
      error.statusCode = 409;
      error.code = 'CONSULTATION_ALREADY_EXISTS';
      throw error;
    }

    // Instantiate consultation
    const consultation = new Consultation({
      patientId,
      appointmentId,
      doctorId: doctorId || consultationData.doctorId,
      consultationDate: consultationDate || new Date(),
      vitalSigns: vitalSigns || {},
      presentingComplaints: presentingComplaints || [],
      symptoms: symptoms || [],
      clinicalObservations,
      diagnoses: diagnoses || [],
      doctorNotes: doctorNotes || '',
      followUpRecommendations: followUpRecommendations || { followUpRequired: false },
      status: 'completed',
    });

    await consultation.save();

    // Mark appointment as completed in shared appointment collection
    appointment.status = 'completed';
    await appointment.save();

    // Update patient's cumulative medical record summary
    await this.syncMedicalRecordOnConsultation(patientId, consultation);

    return await this.getConsultationById(consultation._id);
  }

  /**
   * Retrieve full consultation details with populated references
   */
  async getConsultationById(consultationId) {
    const consultation = await Consultation.findById(consultationId)
      .populate('patientId', 'patientId universityId firstName lastName email phoneNumber gender dateOfBirth bloodGroup department')
      .populate('doctorId', 'title firstName lastName specialization medicalLicenseNumber')
      .populate('appointmentId', 'appointmentNumber appointmentDate appointmentTime reasonForVisit queueNumber')
      .populate('prescriptionHandoff.prescriptionId');

    if (!consultation) {
      const error = new Error(`Consultation with ID ${consultationId} not found.`);
      error.statusCode = 404;
      error.code = 'CONSULTATION_NOT_FOUND';
      throw error;
    }

    return consultation;
  }

  /**
   * Retrieve chronological consultation history for a specific patient
   */
  async getPatientConsultationHistory(patientId, { page = 1, limit = 20, sort = 'desc' }) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = sort === 'asc' ? 1 : -1;

    const filter = { patientId };

    const [consultations, total] = await Promise.all([
      Consultation.find(filter)
        .populate('doctorId', 'title firstName lastName specialization')
        .populate('appointmentId', 'appointmentNumber appointmentDate')
        .sort({ consultationDate: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Consultation.countDocuments(filter),
    ]);

    return {
      consultations,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Controlled and traceable update to an existing consultation
   */
  async updateConsultation(consultationId, updateData, doctorUser, reasonForChange) {
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      const error = new Error(`Consultation with ID ${consultationId} not found.`);
      error.statusCode = 404;
      error.code = 'CONSULTATION_NOT_FOUND';
      throw error;
    }

    if (!reasonForChange || reasonForChange.trim().length === 0) {
      const error = new Error('Clinical record amendment requires an explicit reason for change.');
      error.statusCode = 400;
      error.code = 'AMENDMENT_REASON_REQUIRED';
      throw error;
    }

    // Capture snapshot for audit trail
    const snapshotBefore = {
      clinicalObservations: consultation.clinicalObservations,
      diagnoses: consultation.diagnoses,
      doctorNotes: consultation.doctorNotes,
      vitalSigns: consultation.vitalSigns,
      followUpRecommendations: consultation.followUpRecommendations,
    };

    // Apply allowed modifications
    if (updateData.clinicalObservations !== undefined) {
      consultation.clinicalObservations = updateData.clinicalObservations;
    }
    if (updateData.doctorNotes !== undefined) {
      consultation.doctorNotes = updateData.doctorNotes;
    }
    if (updateData.vitalSigns) {
      consultation.vitalSigns = { ...consultation.vitalSigns, ...updateData.vitalSigns };
    }
    if (updateData.followUpRecommendations) {
      consultation.followUpRecommendations = updateData.followUpRecommendations;
    }
    if (updateData.diagnoses && Array.isArray(updateData.diagnoses)) {
      consultation.diagnoses = updateData.diagnoses;
    }

    consultation.status = 'amended';

    // Append to immutable audit trail
    consultation.auditTrail.push({
      modifiedBy: doctorUser._id,
      modifiedByName: `${doctorUser.title || 'Dr.'} ${doctorUser.firstName} ${doctorUser.lastName}`,
      modifiedAt: new Date(),
      reasonForChange,
      changesSummary: `Record amended by ${doctorUser.firstName} ${doctorUser.lastName}: ${reasonForChange}`,
      snapshotBefore,
    });

    await consultation.save();
    return await this.getConsultationById(consultation._id);
  }

  /**
   * Add or update diagnosis without overwriting consultation history
   */
  async recordDiagnosis(consultationId, diagnosisPayload, doctorUser) {
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      const error = new Error(`Consultation with ID ${consultationId} not found.`);
      error.statusCode = 404;
      error.code = 'CONSULTATION_NOT_FOUND';
      throw error;
    }

    const { diagnosisName, diagnosisCode, diagnosisType, severity, clinicalStatus, notes } = diagnosisPayload;

    if (!diagnosisName) {
      const error = new Error('Diagnosis name is mandatory.');
      error.statusCode = 400;
      error.code = 'DIAGNOSIS_NAME_REQUIRED';
      throw error;
    }

    // Append new diagnosis to existing array (never overwrite past diagnoses)
    consultation.diagnoses.push({
      diagnosisName,
      diagnosisCode: diagnosisCode || '',
      diagnosisType: diagnosisType || 'primary',
      severity: severity || 'moderate',
      clinicalStatus: clinicalStatus || 'active',
      notes: notes || '',
      recordedAt: new Date(),
    });

    // Add audit log note
    consultation.auditTrail.push({
      modifiedBy: doctorUser._id,
      modifiedByName: `${doctorUser.title || 'Dr.'} ${doctorUser.firstName} ${doctorUser.lastName}`,
      modifiedAt: new Date(),
      reasonForChange: `Recorded diagnosis: ${diagnosisName} (${diagnosisType || 'primary'})`,
      changesSummary: `New diagnosis added without overwriting existing diagnoses.`,
    });

    await consultation.save();
    return await this.getConsultationById(consultation._id);
  }

  /**
   * Synchronize cumulative medical record metrics when a consultation is saved
   */
  async syncMedicalRecordOnConsultation(patientId, consultation) {
    try {
      let record = await MedicalRecord.findOne({ patientId });
      if (!record) {
        record = new MedicalRecord({
          patientId,
          totalClinicVisits: 1,
          lastClinicVisit: consultation.consultationDate,
        });
      } else {
        record.totalClinicVisits = (record.totalClinicVisits || 0) + 1;
        record.lastClinicVisit = consultation.consultationDate;
      }

      // If any chronic diagnosis was identified, reflect into chronicConditions
      if (consultation.diagnoses && consultation.diagnoses.length > 0) {
        consultation.diagnoses.forEach((diag) => {
          if (diag.clinicalStatus === 'active' && diag.diagnosisType === 'primary') {
            const alreadyExists = record.chronicConditions.some(
              (c) => c.condition.toLowerCase() === diag.diagnosisName.toLowerCase()
            );
            // If condition appears recurrent or severe, register in summary if not already present
            if (!alreadyExists && diag.severity === 'critical') {
              record.chronicConditions.push({
                condition: diag.diagnosisName,
                icdCode: diag.diagnosisCode,
                diagnosedDate: new Date(),
                status: 'active',
              });
            }
          }
        });
      }

      await record.save();
    } catch (err) {
      console.error('[MedicalRecord Sync Error]', err.message);
      // Non-blocking for consultation creation
    }
  }
}

module.exports = new ConsultationService();

