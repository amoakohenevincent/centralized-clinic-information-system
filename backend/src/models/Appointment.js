const mongoose = require("mongoose");

const ACTIVE_STATUSES = ["booked", "checked_in", "in_consultation"];
const STATUSES = [...ACTIVE_STATUSES, "completed", "cancelled", "no_show"];

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true
    },
    doctorId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
      index: true
    },
    startsAt: {
      type: Date,
      required: true
    },
    endsAt: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          return value > this.startsAt;
        },
        message: "Appointment end time must be after its start time."
      }
    },
    status: {
      type: String,
      enum: STATUSES,
      default: "booked",
      required: true
    },
    createdBy: {
      type: String,
      required: true,
      trim: true
    },
    source: {
      type: String,
      enum: ["patient", "receptionist"],
      required: true
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  { timestamps: true, versionKey: false }
);

appointmentSchema.index(
  { doctorId: 1, startsAt: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ACTIVE_STATUSES } }
  }
);

module.exports = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
