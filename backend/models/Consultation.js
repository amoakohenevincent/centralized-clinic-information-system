const mongoose = require('mongoose');

/**
 * Diagnosis Sub-Schema
 * Non-destructive diagnosis record embedded inside Consultation.
 */
const diagnosisSchema = new mongoose.Schema(
  {
    diagnosisName: {
      type: String,
      required: [true, 'Diagnosis name is required'],
      trim: true,
    },
    diagnosisCode: {
      type: String, // ICD-10 or clinical code (e.g. J02.9, E11.9)
      trim: true,
      default: '',
    },
    diagnosisType: {
      type: String,
      enum: ['primary', 'secondary', 'differential', 'provisional'],
      default: 'primary',
      required: true,
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'critical'],
      default: 'moderate',
    },
    clinicalStatus: {
      type: String,
      enum: ['active', 'recurrence', 'resolved', 'controlled'],
      default: 'active',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

/**
 * Audit Trail Sub-Schema
 * Tracks controlled, traceable edits to finalized clinical documentation.
 */
const auditEntrySchema = new mongoose.Schema(
  {
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    modifiedByName: {
      type: String,
    },
    modifiedAt: {
      type: Date,
      default: Date.now,
    },
    reasonForChange: {
      type: String,
      required: [true, 'Reason for clinical record modification is legally required'],
      trim: true,
    },
    changesSummary: {
      type: String,
      trim: true,
    },
    snapshotBefore: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { _id: true }
);

/**
 * Consultation Schema — Core clinical consultation record
 */
const consultationSchema = new mongoose.Schema(
  {
    consultationNumber: {
      type: String,
      unique: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
      index: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment reference is required'],
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor reference is required'],
      index: true,
    },
    consultationDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'amended', 'cancelled'],
      default: 'completed',
      index: true,
    },

    // Vital signs recorded during clinical triage/consultation
    vitalSigns: {
      bloodPressure: {
        type: String, // e.g. "120/80"
        trim: true,
      },
      heartRate: {
        type: Number, // bpm
        min: 30,
        max: 250,
      },
      temperature: {
        type: Number, // Celsius
        min: 30.0,
        max: 45.0,
      },
      respiratoryRate: {
        type: Number, // breaths/min
        min: 8,
        max: 60,
      },
      oxygenSaturation: {
        type: Number, // SpO2 %
        min: 50,
        max: 100,
      },
      weight: {
        type: Number, // kg
        min: 1,
        max: 300,
      },
      height: {
        type: Number, // cm
        min: 30,
        max: 250,
      },
      bmi: {
        type: Number, // Auto-computed or manual
      },
    },

    // Presenting complaints (Chief Complaints)
    presentingComplaints: [
      {
        complaint: {
          type: String,
          required: [true, 'Complaint description is required'],
          trim: true,
        },
        duration: {
          type: String, // e.g. "3 days", "2 weeks"
          trim: true,
        },
        severity: {
          type: String,
          enum: ['mild', 'moderate', 'severe'],
          default: 'moderate',
        },
      },
    ],

    // Symptoms reported by patient
    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],

    // Physical examination, systemic review & clinical observations
    clinicalObservations: {
      type: String,
      required: [true, 'Clinical observations or findings are required'],
      trim: true,
    },

    // Recorded diagnoses
    diagnoses: {
      type: [diagnosisSchema],
      validate: {
        validator: function (val) {
          // A completed consultation must have at least one diagnosis
          if (this.status === 'completed' || this.status === 'amended') {
            return Array.isArray(val) && val.length > 0;
          }
          return true;
        },
        message: 'A completed consultation must record at least one diagnosis',
      },
    },

    // Doctor's clinical notes (internal / professional documentation)
    doctorNotes: {
      type: String,
      trim: true,
      default: '',
    },

    // Recommendations & follow-up care
    followUpRecommendations: {
      followUpRequired: {
        type: Boolean,
        default: false,
      },
      followUpDate: {
        type: Date,
      },
      instructions: {
        type: String,
        trim: true,
        default: '',
      },
    },

    // Prescription Handoff to Module 3 (Prescription Management)
    prescriptionHandoff: {
      initiated: {
        type: Boolean,
        default: false,
      },
      initiatedAt: {
        type: Date,
      },
      prescriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription',
      },
      handoffNotes: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        enum: ['none', 'pending_rx_creation', 'prescribed', 'dispensed'],
        default: 'none',
      },
    },

    // Traceable audit trail of changes
    auditTrail: [auditEntrySchema],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: auto-generate unique consultation number & auto-calculate BMI
consultationSchema.pre('save', function (next) {
  if (!this.consultationNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.consultationNumber = `CNS-${timestamp}-${random}`;
  }

  // Auto-calculate BMI if weight and height are provided
  if (this.vitalSigns?.weight && this.vitalSigns?.height) {
    const heightInMeters = this.vitalSigns.height / 100;
    const computedBMI = this.vitalSigns.weight / (heightInMeters * heightInMeters);
    this.vitalSigns.bmi = parseFloat(computedBMI.toFixed(1));
  }

  next();
});

// Compound index for fast chronological lookups by patient
consultationSchema.index({ patientId: 1, consultationDate: -1 });

module.exports = mongoose.models.Consultation || mongoose.model('Consultation', consultationSchema);

