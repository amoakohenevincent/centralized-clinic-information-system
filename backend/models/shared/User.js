const mongoose = require('mongoose');

/**
 * Shared User Reference Model (Doctors, Nurses, Clinic Administrators)
 * Managed through central authentication & JWT verification.
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['doctor', 'nurse', 'pharmacist', 'admin', 'receptionist'],
      required: true,
      default: 'doctor',
    },
    title: {
      type: String, // Dr., Prof., Nurse
      default: 'Dr.',
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
    specialization: {
      type: String, // General Medicine, Internal Medicine, Pediatrics
      default: 'General Practice',
    },
    medicalLicenseNumber: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      default: 'University Health Services',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    virtuals: {
      fullName: {
        get() {
          return `${this.title} ${this.firstName} ${this.lastName}`;
        },
      },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

