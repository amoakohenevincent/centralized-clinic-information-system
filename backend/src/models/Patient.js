const { randomUUID } = require("node:crypto");
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    patientNumber: {
      type: String,
      unique: true,
      immutable: true
    },
    userId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    legalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    preferredName: {
      type: String,
      trim: true,
      maxlength: 80
    },
    dateOfBirth: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          return value <= new Date();
        },
        message: "Date of birth cannot be in the future."
      }
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30
    },
    address: {
      type: String,
      trim: true,
      maxlength: 300
    },
    emergencyContact: {
      name: { type: String, trim: true, maxlength: 120 },
      phone: { type: String, trim: true, maxlength: 30 },
      relationship: { type: String, trim: true, maxlength: 60 }
    }
  },
  { timestamps: true, versionKey: false }
);

patientSchema.pre("validate", function assignPatientNumber() {
  if (!this.patientNumber) {
    this.patientNumber = `CCIS-PT-${randomUUID().toUpperCase()}`;
  }
});

module.exports = mongoose.models.Patient || mongoose.model("Patient", patientSchema);
