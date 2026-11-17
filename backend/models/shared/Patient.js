const mongoose = require('mongoose');

/**
 * Shared Patient Reference Model
 * Owned by Module 1: Patient and Appointment Management.
 * Re-used here as a Mongoose reference model to avoid duplicating collections.
 */
const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    universityId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true, // Student ID or Staff ID (e.g. STU-2024-0891 or EMP-1044)
    },
    patientType: {
      type: String,
      enum: ['student', 'staff', 'dependent', 'visitor'],
      default: 'student',
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    department: {
      type: String, // e.g. Faculty of Computing, Faculty of Engineering
      trim: true,
    },
  },
  {
    timestamps: true,
    virtuals: {
      fullName: {
        get() {
          return `${this.firstName} ${this.lastName}`;
        },
      },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.models.Patient || mongoose.model('Patient', patientSchema);

