const mongoose = require('mongoose');

/**
 * Shared Appointment Reference Model
 * Owned by Module 1: Patient and Appointment Management.
 */
const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
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
      index: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
      index: true,
    },
    appointmentTime: {
      type: String, // e.g. "09:30 AM"
      required: true,
    },
    appointmentType: {
      type: String,
      enum: ['routine', 'urgent', 'follow-up', 'walk-in', 'referral'],
      default: 'routine',
    },
    status: {
      type: String,
      enum: ['scheduled', 'checked-in', 'in-consultation', 'completed', 'cancelled', 'no-show'],
      default: 'checked-in',
      index: true,
    },
    reasonForVisit: {
      type: String,
      trim: true,
    },
    queueNumber: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

