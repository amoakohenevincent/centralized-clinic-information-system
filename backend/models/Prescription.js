const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Subdocument schema for prescribed medication items.
 * Preserves a clinical snapshot of medication attributes (name, strength, form)
 * to ensure historical immutability.
 */
const PrescriptionItemSchema = new Schema(
  {
    medicineId: {
      type: Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Medicine ID reference from shared catalogue is required']
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name snapshot is required'],
      trim: true
    },
    strength: {
      type: String,
      required: [true, 'Strength is required (e.g., 500mg, 10mg/5ml)'],
      trim: true
    },
    form: {
      type: String,
      required: [true, 'Dosage form is required'],
      enum: ['Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Inhaler', 'Ointment', 'Drops', 'Other']
    },
    dosage: {
      type: String,
      required: [true, 'Dosage instructions are required (e.g., 1 tablet, 5ml)'],
      trim: true
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      enum: [
        'Once daily (OD)',
        'Twice daily (BD)',
        'Three times daily (TDS)',
        'Four times daily (QDS)',
        'Every 4 hours (q4h)',
        'Every 6 hours (q6h)',
        'Every 8 hours (q8h)',
        'As needed / PRN',
        'Stat / Immediate single dose',
        'At bedtime (ON)'
      ]
    },
    duration: {
      type: String,
      required: [true, 'Duration is required (e.g., 5 days, 2 weeks)'],
      trim: true
    },
    quantityPrescribed: {
      type: Number,
      required: [true, 'Quantity prescribed is required'],
      min: [1, 'Quantity prescribed must be at least 1']
    },
    quantityDispensed: {
      type: Number,
      default: 0,
      min: [0, 'Quantity dispensed cannot be negative']
    },
    itemStatus: {
      type: String,
      enum: ['pending', 'dispensed', 'partially_dispensed', 'backordered', 'cancelled'],
      default: 'pending'
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [300, 'Instructions cannot exceed 300 characters'],
      default: ''
    }
  },
  { _id: true }
);

/**
 * Audit log entry schema to record controlled pre-dispense modifications
 */
const AuditLogEntrySchema = new Schema(
  {
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    modifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: ['created', 'updated_before_dispense', 'cancelled', 'dispense_recorded'],
      required: true
    },
    reason: {
      type: String,
      trim: true,
      default: ''
    },
    previousValues: {
      type: Schema.Types.Mixed
    }
  },
  { _id: false }
);

/**
 * Dispensing record schema populated when pharmacy executes dispensing
 */
const DispensingRecordSchema = new Schema(
  {
    dispensedAt: {
      type: Date,
      default: Date.now
    },
    pharmacistId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    pharmacistName: {
      type: String,
      required: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    itemsDispensed: [
      {
        medicineId: Schema.Types.ObjectId,
        dispensedQuantity: Number,
        batchNumber: String
      }
    ]
  },
  { _id: false }
);

/**
 * Main CCIS Prescription Schema
 */
const PrescriptionSchema = new Schema(
  {
    prescriptionNumber: {
      type: String,
      required: [true, 'Prescription number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient ID reference is required'],
      index: true
    },
    // Optional snapshot fields for patient presentation
    patientName: {
      type: String,
      trim: true,
      default: ''
    },
    patientIdentifier: {
      type: String,
      trim: true,
      default: '' // e.g. Student ID or Staff ID
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID reference is required'],
      index: true
    },
    doctorName: {
      type: String,
      trim: true,
      default: ''
    },
    consultationId: {
      type: Schema.Types.ObjectId,
      ref: 'Consultation',
      default: null,
      index: true
    },
    prescriptionDate: {
      type: Date,
      default: Date.now,
      required: true,
      index: true
    },
    clinicalDiagnosis: {
      type: String,
      trim: true,
      default: ''
    },
    items: {
      type: [PrescriptionItemSchema],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'A prescription must contain at least one medication item.'
      }
    },
    status: {
      type: String,
      enum: ['pending', 'partially_dispensed', 'fulfilled', 'pending_backorder', 'cancelled'],
      default: 'pending',
      index: true
    },
    generalInstructions: {
      type: String,
      trim: true,
      maxlength: [1000, 'General instructions cannot exceed 1000 characters'],
      default: ''
    },
    isControlledMedication: {
      type: Boolean,
      default: false
    },
    auditTrail: [AuditLogEntrySchema],
    dispensingHistory: [DispensingRecordSchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// High-efficiency composite query indexes
PrescriptionSchema.index({ status: 1, createdAt: -1 });
PrescriptionSchema.index({ patientId: 1, createdAt: -1 });
PrescriptionSchema.index({ doctorId: 1, createdAt: -1 });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
