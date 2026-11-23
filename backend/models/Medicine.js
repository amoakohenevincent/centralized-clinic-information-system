const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Shared Medicine Catalogue Model.
 * This collection is maintained by Module 4 (Pharmacy and Inventory Management).
 * The Prescription Management Module references this collection in read-only mode
 * to validate medicine IDs, display strengths, dosage forms, and live stock levels.
 */
const MedicineSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    genericName: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    },
    strength: {
      type: String,
      required: true,
      trim: true // e.g. "500mg", "250mg/5ml"
    },
    form: {
      type: String,
      required: true,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Inhaler', 'Ointment', 'Drops', 'Other']
    },
    unitOfMeasure: {
      type: String,
      default: 'Unit'
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0
    },
    reorderLevel: {
      type: Number,
      default: 20
    },
    isControlled: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

MedicineSchema.index({ name: 'text', genericName: 'text', category: 'text' });

module.exports = mongoose.model('Medicine', MedicineSchema);
