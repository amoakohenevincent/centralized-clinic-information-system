const mongoose = require('mongoose');

/**
 * Shared Prescription Reference Model
 * Owned by Module 3: Prescription Management.
 * Referenced by Clinical Records to display previous prescriptions in Medical History.
 */
const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      required: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prescriptionDate: {
      type: Date,
      default: Date.now,
    },
    medications: [
      {
        medicationName: { type: String, required: true },
        dosage: { type: String, required: true }, // e.g. "500mg"
        frequency: { type: String, required: true }, // e.g. "TDS (3x daily)"
        duration: { type: String, required: true }, // e.g. "5 days"
        instructions: { type: String }, // e.g. "Take after meals"
        quantity: { type: Number, default: 1 },
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'issued', 'dispensed', 'partially_dispensed', 'cancelled'],
      default: 'issued',
    },
    clinicalNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema);

