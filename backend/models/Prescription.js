const mongoose = require('mongoose');
const { Schema } = mongoose;

const PrescriptionItemSchema = new Schema(
  {
    medicineId: {
      type: Schema.Types.ObjectId,
      ref: 'Medicine',
      required: false,
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    strength: {
      type: String,
      trim: true,
      default: 'Standard',
    },
    form: {
      type: String,
      default: 'Tablet',
    },
    dosage: {
      type: String,
      required: [true, 'Dosage instructions are required'],
      trim: true,
    },
    frequency: {
      type: String,
      default: 'Twice daily (BD)',
      trim: true,
    },
    duration: {
      type: String,
      default: '5 days',
      trim: true,
    },
    quantityPrescribed: {
      type: Number,
      default: 1,
      min: [1, 'Quantity prescribed must be at least 1'],
    },
    quantityDispensed: {
      type: Number,
      default: 0,
      min: 0,
    },
    itemStatus: {
      type: String,
      enum: ['pending', 'dispensed', 'partially_dispensed', 'backordered', 'cancelled'],
      default: 'pending',
    },
    instructions: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: true }
);

const AuditLogEntrySchema = new Schema(
  {
    modifiedAt: {
      type: Date,
      default: Date.now,
    },
    modifiedBy: {
      type: Schema.Types.Mixed,
    },
    action: {
      type: String,
      enum: ['created', 'updated_before_dispense', 'cancelled', 'dispense_recorded'],
      default: 'created',
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    previousValues: {
      type: Schema.Types.Mixed,
    },
  },
  { _id: false }
);

const DispensingRecordSchema = new Schema(
  {
    dispensedAt: {
      type: Date,
      default: Date.now,
    },
    pharmacistId: {
      type: Schema.Types.Mixed,
    },
    pharmacistName: {
      type: String,
      default: 'Pharmacist',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    itemsDispensed: [
      {
        medicineId: Schema.Types.ObjectId,
        dispensedQuantity: Number,
        batchNumber: String,
      },
    ],
  },
  { _id: false }
);

const PrescriptionSchema = new Schema(
  {
    prescriptionNumber: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
      index: true,
    },
    patientName: {
      type: String,
      trim: true,
      default: '',
    },
    patientIdentifier: {
      type: String,
      trim: true,
      default: '',
    },
    doctorId: {
      type: Schema.Types.Mixed,
      required: [true, 'Doctor reference is required'],
      index: true,
    },
    doctorName: {
      type: String,
      trim: true,
      default: '',
    },
    consultationId: {
      type: Schema.Types.ObjectId,
      ref: 'Consultation',
      default: null,
      index: true,
    },
    prescriptionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    clinicalDiagnosis: {
      type: String,
      trim: true,
      default: '',
    },
    items: {
      type: [PrescriptionItemSchema],
      default: [],
    },
    // Backwards-compatible alias for items
    medications: [
      {
        medicationName: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String,
        quantity: Number,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'partially_dispensed', 'fulfilled', 'dispensed', 'issued', 'draft', 'pending_backorder', 'cancelled'],
      default: 'pending',
      index: true,
    },
    generalInstructions: {
      type: String,
      trim: true,
      default: '',
    },
    isControlledMedication: {
      type: Boolean,
      default: false,
    },
    auditTrail: [AuditLogEntrySchema],
    dispensingHistory: [DispensingRecordSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PrescriptionSchema.pre('validate', function () {
  if (!this.prescriptionNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const rand = Math.floor(100 + Math.random() * 900);
    this.prescriptionNumber = `RX-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${timestamp}`;
  }

  // Sync items and medications if one is provided
  if ((!this.items || this.items.length === 0) && this.medications && this.medications.length > 0) {
    this.items = this.medications.map((m) => ({
      medicineName: m.medicationName,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      instructions: m.instructions || '',
      quantityPrescribed: m.quantity || 1,
      quantityDispensed: 0,
      itemStatus: 'pending',
    }));
  }
});

const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);
module.exports = Prescription;

