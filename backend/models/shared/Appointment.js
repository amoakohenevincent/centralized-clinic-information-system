const mongoose = require('mongoose');

const STATUSES = [
  'booked',
  'scheduled',
  'checked-in',
  'checked_in',
  'in-consultation',
  'in_consultation',
  'completed',
  'cancelled',
  'no-show',
  'no_show',
];

/**
 * Unified Appointment Model for CCIS
 * Connects Module 1 (Patient/Appointments) with Module 2 (Doctor Triage & Consultations).
 */
const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
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
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    appointmentDate: {
      type: Date,
      index: true,
    },
    appointmentTime: {
      type: String, // e.g. "09:30 AM"
      default: '09:00 AM',
    },
    startsAt: {
      type: Date,
      index: true,
    },
    endsAt: {
      type: Date,
      validate: {
        validator(value) {
          if (!value || !this.startsAt) return true;
          return value > this.startsAt;
        },
        message: 'Appointment end time must be after its start time.',
      },
    },
    appointmentType: {
      type: String,
      enum: ['routine', 'urgent', 'follow-up', 'walk-in', 'referral'],
      default: 'routine',
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'checked-in',
      index: true,
    },
    reasonForVisit: {
      type: String,
      trim: true,
      default: 'Consultation',
    },
    queueNumber: {
      type: Number,
      default: 1,
    },
    createdBy: {
      type: String,
      default: 'system',
    },
    source: {
      type: String,
      enum: ['patient', 'receptionist', 'doctor'],
      default: 'receptionist',
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

appointmentSchema.pre('validate', function () {
  if (!this.appointmentNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const rand = Math.floor(100 + Math.random() * 900);
    this.appointmentNumber = `APT-${timestamp}-${rand}`;
  }

  if (this.startsAt && !this.appointmentDate) {
    this.appointmentDate = this.startsAt;
    const hours = this.startsAt.getHours();
    const minutes = String(this.startsAt.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = String(hours % 12 || 12).padStart(2, '0');
    this.appointmentTime = `${formattedHours}:${minutes} ${ampm}`;
  } else if (this.appointmentDate && !this.startsAt) {
    this.startsAt = this.appointmentDate;
    if (!this.endsAt) {
      this.endsAt = new Date(this.startsAt.getTime() + 30 * 60000); // 30 min duration
    }
  }

  if (this.startsAt && !this.endsAt) {
    this.endsAt = new Date(this.startsAt.getTime() + 30 * 60000);
  }
});

const ACTIVE_STATUSES = ['booked', 'checked_in', 'in_consultation', 'scheduled', 'checked-in', 'in-consultation'];

appointmentSchema.index(
  { doctorId: 1, startsAt: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ACTIVE_STATUSES } },
  }
);

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
