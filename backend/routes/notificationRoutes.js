const express = require('express');
const router = express.Router();
const smsService = require('../services/smsService');

/**
 * @route   GET /api/notifications/sms
 * @desc    Get all dispatched SMS logs with delivery receipts
 * @access  Private (Authenticated users / Staff / Evaluator Demo)
 */
router.get('/sms', async (req, res) => {
  try {
    const { limit = 20, eventType } = req.query;
    const { logs, total } = await smsService.getLogs({ limit, eventType });

    return res.status(200).json({
      success: true,
      total,
      count: logs.length,
      gateway: smsService.isLive ? 'Twilio Cloud Live API' : 'Twilio SMS Sandbox Gateway',
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching SMS logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve SMS delivery receipts.',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/notifications/test-sms
 * @desc    Send a test SMS to demonstrate external service in real time
 * @access  Private (Authenticated users)
 */
router.post('/test-sms', async (req, res) => {
  try {
    const { to, recipient = 'Test Recipient', message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: 'Both "to" (phone number) and "message" are required.',
      });
    }

    const result = await smsService.sendSMS({
      to,
      recipient,
      message,
      eventType: 'test_sms',
      metadata: { initiatedBy: req.user?.username || 'System User' },
    });

    return res.status(200).json({
      success: true,
      message: 'SMS successfully dispatched through External Gateway.',
      receipt: result,
    });
  } catch (error) {
    console.error('Error sending test SMS:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to dispatch SMS.',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/notifications/appointment-confirmation
 * @desc    Dispatch appointment confirmation SMS when scheduled via portal or public booking
 * @access  Private (Authenticated users)
 */
router.post('/appointment-confirmation', async (req, res) => {
  try {
    const { patientName, phone, doctorName, startsAt, appointmentNumber } = req.body;
    const receipt = await smsService.sendConfirmation({
      appointmentNumber: appointmentNumber || `APT-${Date.now().toString().slice(-6)}`,
      patientName: patientName || req.user?.name || 'Patient',
      phone: phone || '+233551234567',
      doctorName: doctorName || 'General Medical Officer',
      startsAt: startsAt || new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: 'Appointment confirmation SMS dispatched.',
      receipt,
    });
  } catch (error) {
    console.error('Error dispatching appointment confirmation SMS:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/notifications/prescription-alert
 * @desc    Dispatch prescription collection alert when fulfilled/partially dispensed
 * @access  Private (Authenticated users)
 */
router.post('/prescription-alert', async (req, res) => {
  try {
    const { prescriptionNumber, patientName, phone, status = 'fulfilled', items = [] } = req.body;
    const receipt =
      status === 'partially_dispensed'
        ? await smsService.sendPrescriptionPartialAlert({ prescriptionNumber, patientName, phone, status, items })
        : await smsService.sendPrescriptionReadyAlert({ prescriptionNumber, patientName, phone, status, items });

    return res.status(200).json({
      success: true,
      message: 'Prescription pickup SMS dispatched.',
      receipt,
    });
  } catch (error) {
    console.error('Error dispatching prescription SMS:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/notifications/stats
 * @desc    Get SMS Gateway delivery analytics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await smsService.getStats();
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
