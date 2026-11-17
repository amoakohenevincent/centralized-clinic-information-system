const mongoose = require('mongoose');

/**
 * Patient Medical Record Schema
 * Consolidated longitudinal medical profile belonging to the Clinical Records module.
 * Summarizes chronic conditions, allergies, surgical histories, and clinic visit summaries.
 */
const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      unique: true,
      index: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    knownAllergies: [
      {
        allergen: { type: String, required: true, trim: true },
        category: { type: String, enum: ['drug', 'food', 'environmental', 'other'], default: 'drug' },
        reaction: { type: String, trim: true },
        severity: { type: String, enum: ['mild', 'moderate', 'severe', 'life-threatening'], default: 'moderate' },
        recordedAt: { type: Date, default: Date.now },
      },
    ],
    chronicConditions: [
      {
        condition: { type: String, required: true, trim: true },
        icdCode: { type: String, trim: true },
        diagnosedDate: { type: Date },
        status: { type: String, enum: ['active', 'managed', 'in-remission', 'resolved'], default: 'active' },
        managingDoctor: { type: String, trim: true },
      },
    ],
    pastSurgeries: [
      {
        procedure: { type: String, required: true, trim: true },
        year: { type: Number },
        hospital: { type: String, trim: true },
        notes: { type: String, trim: true },
      },
    ],
    immunizationRecords: [
      {
        vaccineName: { type: String, required: true, trim: true },
        administeredDate: { type: Date, required: true },
        doseNumber: { type: Number, default: 1 },
        batchNumber: { type: String, trim: true },
        administeredBy: { type: String, trim: true },
      },
    ],
    familyMedicalHistory: [
      {
        relationship: { type: String, required: true, trim: true }, // e.g. Mother, Father, Sibling
        condition: { type: String, required: true, trim: true }, // e.g. Type 2 Diabetes, Hypertension
        notes: { type: String, trim: true },
      },
    ],
    lastClinicVisit: {
      type: Date,
    },
    totalClinicVisits: {
      type: Number,
      default: 0,
    },
    riskAlerts: [
      {
        alertMessage: { type: String, required: true },
        severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', medicalRecordSchema);

