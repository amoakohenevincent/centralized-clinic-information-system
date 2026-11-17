const MedicalRecord = require('../models/MedicalRecord');
const Consultation = require('../models/Consultation');
const Patient = require('../models/shared/Patient');
const Prescription = require('../models/shared/Prescription');

class MedicalRecordService {
  /**
   * Retrieve full longitudinal medical history for a patient
   */
  async getPatientMedicalHistory(patientId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      const error = new Error(`Patient with ID ${patientId} not found.`);
      error.statusCode = 404;
      error.code = 'PATIENT_NOT_FOUND';
      throw error;
    }

    // 1. Fetch or create baseline medical record summary
    let medicalRecord = await MedicalRecord.findOne({ patientId }).lean();
    if (!medicalRecord) {
      // Initialize an empty profile if not yet created
      const newRec = new MedicalRecord({
        patientId,
        bloodGroup: patient.bloodGroup || 'Unknown',
        totalClinicVisits: 0,
      });
      medicalRecord = (await newRec.save()).toObject();
    }

    // 2. Fetch past consultations with diagnoses and vitals
    const consultations = await Consultation.find({ patientId })
      .populate('doctorId', 'title firstName lastName specialization')
      .populate('appointmentId', 'appointmentNumber appointmentDate')
      .sort({ consultationDate: -1 })
      .lean();

    // 3. Fetch past prescriptions from shared prescription module
    const prescriptions = await Prescription.find({ patientId })
      .populate('doctorId', 'title firstName lastName')
      .sort({ prescriptionDate: -1 })
      .lean();

    // Extract cumulative diagnosis list across all consultations
    const recordedDiagnosesHistory = [];
    consultations.forEach((c) => {
      if (c.diagnoses && c.diagnoses.length > 0) {
        c.diagnoses.forEach((d) => {
          recordedDiagnosesHistory.push({
            diagnosisId: d._id,
            diagnosisName: d.diagnosisName,
            diagnosisCode: d.diagnosisCode,
            diagnosisType: d.diagnosisType,
            severity: d.severity,
            clinicalStatus: d.clinicalStatus,
            consultationId: c._id,
            consultationDate: c.consultationDate,
            doctorName: c.doctorId ? `${c.doctorId.title || 'Dr.'} ${c.doctorId.firstName} ${c.doctorId.lastName}` : 'Attending Physician',
          });
        });
      }
    });

    return {
      patient: {
        _id: patient._id,
        patientId: patient.patientId,
        universityId: patient.universityId,
        patientType: patient.patientType,
        firstName: patient.firstName,
        lastName: patient.lastName,
        fullName: `${patient.firstName} ${patient.lastName}`,
        email: patient.email,
        phoneNumber: patient.phoneNumber,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        emergencyContact: patient.emergencyContact,
        department: patient.department,
      },
      summary: {
        totalVisits: consultations.length,
        lastVisitDate: consultations.length > 0 ? consultations[0].consultationDate : null,
        bloodGroup: medicalRecord.bloodGroup || patient.bloodGroup || 'Unknown',
        knownAllergies: medicalRecord.knownAllergies || [],
        chronicConditions: medicalRecord.chronicConditions || [],
        pastSurgeries: medicalRecord.pastSurgeries || [],
        immunizationRecords: medicalRecord.immunizationRecords || [],
        familyMedicalHistory: medicalRecord.familyMedicalHistory || [],
        riskAlerts: medicalRecord.riskAlerts || [],
      },
      consultationsTimeline: consultations,
      recordedDiagnosesHistory,
      previousPrescriptions: prescriptions,
    };
  }

  /**
   * Update clinical baseline summary (Allergies, Chronic conditions, Surgeries)
   */
  async updatePatientSummary(patientId, summaryPayload, doctorUser) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      const error = new Error(`Patient with ID ${patientId} not found.`);
      error.statusCode = 404;
      error.code = 'PATIENT_NOT_FOUND';
      throw error;
    }

    let record = await MedicalRecord.findOne({ patientId });
    if (!record) {
      record = new MedicalRecord({ patientId });
    }

    if (summaryPayload.bloodGroup) record.bloodGroup = summaryPayload.bloodGroup;
    if (summaryPayload.knownAllergies) record.knownAllergies = summaryPayload.knownAllergies;
    if (summaryPayload.chronicConditions) record.chronicConditions = summaryPayload.chronicConditions;
    if (summaryPayload.pastSurgeries) record.pastSurgeries = summaryPayload.pastSurgeries;
    if (summaryPayload.immunizationRecords) record.immunizationRecords = summaryPayload.immunizationRecords;
    if (summaryPayload.familyMedicalHistory) record.familyMedicalHistory = summaryPayload.familyMedicalHistory;

    await record.save();
    return await this.getPatientMedicalHistory(patientId);
  }
}

module.exports = new MedicalRecordService();

