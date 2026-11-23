const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Unified CCIS User Model
 * Supports doctors, patients, receptionists, pharmacists, nurses, and administrators.
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
      enum: ['doctor', 'nurse', 'pharmacist', 'admin', 'receptionist', 'patient'],
      required: true,
      default: 'doctor',
    },
    title: {
      type: String,
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
      type: String,
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('fullName').get(function () {
  return `${this.title ? this.title + ' ' : ''}${this.firstName} ${this.lastName}`.trim();
});

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;
