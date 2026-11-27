const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const smsService = require('../services/smsService');

const JWT_SECRET = process.env.JWT_SECRET || 'ccis_shared_jwt_secret_university_clinic_2026';

const generateTestToken = (payload = {}) => {
  return jwt.sign(
    {
      id: payload._id || new mongoose.Types.ObjectId(),
      username: payload.username || 'dr_kmensah',
      role: payload.role || 'doctor',
      firstName: payload.firstName || 'Kwabena',
      lastName: payload.lastName || 'Mensah',
      email: payload.email || 'kwabena.mensah@clinic.ug.edu.gh',
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

describe('External SMS Gateway Service & Notification Endpoints', () => {
  let doctorToken;

  beforeAll(async () => {
    doctorToken = generateTestToken({ role: 'doctor', username: 'dr_kmensah' });
  });

  beforeEach(() => {
    smsService.clearInMemoryLogs();
  });

  it('should reject unauthenticated requests to /api/notifications/sms with 401', async () => {
    const res = await request(app).get('/api/notifications/sms');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_TOKEN_MISSING');
  });

  it('should issue a valid signed JWT via POST /api/auth/demo-session in non-production mode', async () => {
    const res = await request(app)
      .post('/api/auth/demo-session')
      .send({ role: 'pharmacist' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('pharmacist');
  });

  it('should dispatch an SMS through the external gateway, format E.164 Ghana numbers, and store a receipt', async () => {
    const result = await smsService.sendSMS({
      to: '0551234567',
      recipient: 'Kofi Mensah',
      message: 'MediWell Clinic: Test notification message.',
      eventType: 'test_sms',
    });

    expect(result.status).toBe('delivered');
    expect(result.sid).toMatch(/^SM_/);
    expect(result.phone).toBe('+233551234567');

    const { logs, total } = await smsService.getLogs({ limit: 10 });
    expect(total).toBe(1);
    expect(logs[0].messageSid).toBe(result.sid);
    expect(logs[0].recipient).toBe('Kofi Mensah');
  });

  it('should send an appointment confirmation SMS alert with proper formatting', async () => {
    const mockAppointment = {
      _id: new mongoose.Types.ObjectId().toString(),
      appointmentNumber: 'APT-202611-001',
      patientName: 'Ama Serwaa',
      phone: '0241234567',
      doctorId: 'Dr. Kwabena Mensah',
      startsAt: new Date().toISOString(),
    };

    const result = await smsService.sendConfirmation(mockAppointment);
    expect(result.status).toBe('delivered');
    expect(result.phone).toBe('+233241234567');

    const { logs } = await smsService.getLogs({ eventType: 'appointment_booked' });
    expect(logs.length).toBe(1);
    expect(logs[0].message).toContain('is confirmed');
  });

  it('should send a pharmacy prescription ready alert when medications are fulfilled', async () => {
    const mockPrescription = {
      _id: new mongoose.Types.ObjectId().toString(),
      prescriptionNumber: 'RX-202611-8899',
      patientName: 'Kwame Asante',
      phone: '0509876543',
      status: 'fulfilled',
      items: [{ medicineName: 'Amoxicillin' }, { medicineName: 'Paracetamol' }],
    };

    const result = await smsService.sendPrescriptionReadyAlert(mockPrescription);
    expect(result.status).toBe('delivered');

    const { logs } = await smsService.getLogs({ eventType: 'prescription_ready' });
    expect(logs.length).toBe(1);
    expect(logs[0].message).toContain('ready for collection');
  });

  it('should send test SMS and retrieve receipts & stats via authenticated REST endpoints', async () => {
    const dispatchRes = await request(app)
      .post('/api/notifications/test-sms')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        to: '0551112222',
        recipient: 'Student Demo',
        message: 'Live gateway verification text.',
      });

    expect(dispatchRes.status).toBe(200);
    expect(dispatchRes.body.success).toBe(true);
    expect(dispatchRes.body.receipt.status).toBe('delivered');

    const apptSmsRes = await request(app)
      .post('/api/notifications/appointment-confirmation')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        patientName: 'Kofi Mensah',
        phone: '0553334444',
        doctorName: 'Dr. Kwabena Mensah',
      });

    expect(apptSmsRes.status).toBe(200);
    expect(apptSmsRes.body.receipt.status).toBe('delivered');

    const listRes = await request(app)
      .get('/api/notifications/sms')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.length).toBe(2);
    expect(listRes.body.gateway).toBeDefined();

    const statsRes = await request(app)
      .get('/api/notifications/stats')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(statsRes.status).toBe(200);
    expect(statsRes.body.data.totalDispatched).toBe(2);
    expect(statsRes.body.data.appointmentAlerts).toBe(1);
  });
});
