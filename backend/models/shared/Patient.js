const mongoose = require('mongoose');
const { randomUUID } = require('node:crypto');

/**
 * Unified Patient Model for CCIS
 * Bridges Module 1 (Patient/Appointments), Module 2 (Clinical Records), and Module 3 (Prescriptions).
 */
const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    patientNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    universityId: {
      type: String,
      sparse: true,
      index: true,
      trim: true,
    },
    userId: {
      type: String,
      sparse: true,
      index: true,
      trim: true,
    },
    patientType: {
      type: String,
      enum: ['student', 'staff', 'dependent', 'visitor'],
      default: 'student',
    },
    firstName: {
      type: String,
      trim: true,
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    legalName: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    preferredName: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: 'General',
    },
    emergencyContact: {
      name: { type: String, trim: true, default: '' },
      relationship: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

patientSchema.virtual('fullName').get(function () {
  if (this.firstName || this.lastName) {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
  return this.preferredName || this.legalName || 'Patient';
});

// Auto-sync fields between Module 1 and Module 2/3
patientSchema.pre('validate', function () {
  if (!this.patientNumber && !this.patientId) {
    const id = `CCIS-PT-${randomUUID().slice(0, 8).toUpperCase()}`;
    this.patientNumber = id;
    this.patientId = id;
  } else if (this.patientNumber && !this.patientId) {
    this.patientId = this.patientNumber;
  } else if (this.patientId && !this.patientNumber) {
    this.patientNumber = this.patientId;
  }

  if (this.legalName && (!this.firstName || !this.lastName)) {
    const parts = this.legalName.trim().split(' ');
    this.firstName = parts[0] || 'Unknown';
    this.lastName = parts.slice(1).join(' ') || parts[0] || 'Unknown';
  } else if (!this.legalName && (this.firstName || this.lastName)) {
    this.legalName = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  if (this.phoneNumber && !this.phone) {
    this.phone = this.phoneNumber;
  } else if (this.phone && !this.phoneNumber) {
    this.phoneNumber = this.phone;
  }
});

const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
module.exports = Patient;
