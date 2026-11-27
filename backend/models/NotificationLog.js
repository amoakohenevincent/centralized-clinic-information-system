const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'appointment_booked',
        'appointment_checkin',
        'appointment_cancelled',
        'prescription_ready',
        'prescription_partial',
        'test_sms',
      ],
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'queued', 'failed'],
      default: 'delivered',
    },
    gateway: {
      type: String,
      default: 'Twilio SMS Sandbox Gateway',
    },
    messageSid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    carrierLatencyMs: {
      type: Number,
      default: 140,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick queries
notificationLogSchema.index({ phone: 1, eventType: 1, createdAt: -1 });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);

