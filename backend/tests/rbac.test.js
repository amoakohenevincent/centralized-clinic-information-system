const request = require('supertest');
const app = require('../server');
const { connectTestDB, clearTestDB, closeTestDB, generateTestToken } = require('./setup');

const Patient = require('../models/shared/Patient');
const Appointment = require('../models/shared/Appointment');
const User = require('../models/shared/User');
const Consultation = require('../models/Consultation');

describe('Clinical Records Management — Role-Based Access Control (RBAC) & Security Tests', () => {
  let doctorToken;
  let nurseToken;
  let patientToken;
  let testPatient;
  let testAppointment;
  let testDoctor;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    testDoctor = await User.create({
      username: 'dr_kmensah',
      email: 'kwabena.mensah@clinic.ug.edu.gh',
      password: 'hashed_password',
      role: 'doctor',
      title: 'Dr.',
      firstName: 'Kwabena',
      lastName: 'Mensah',
    });

    testPatient = await Patient.create({
      patientId: 'PAT-2026-0001',
      universityId: 'STU-2024-1122',
      patientType: 'student',
      firstName: 'Kofi',
      lastName: 'Mensah',
      email: 'kofi.mensah@st.ug.edu.gh',
      dateOfBirth: new Date('2001-02-14'),
      gender: 'male',
    });

    testAppointment = await Appointment.create({
      appointmentNumber: 'APT-2026-0088',
      patientId: testPatient._id,
      doctorId: testDoctor._id,
      appointmentDate: new Date(),
      appointmentTime: '10:30 AM',
      status: 'checked-in',
    });

    doctorToken = generateTestToken({ role: 'doctor' });
    nurseToken = generateTestToken({ role: 'nurse' });
    patientToken = generateTestToken({ role: 'patient' });
  });

  describe('1. Unauthorized Access Prevention', () => {
    it('should return 401 when no authorization header is provided', async () => {
      const res = await request(app).get('/api/clinical/dashboard/stats');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTH_TOKEN_MISSING');
    });

    it('should return 401 when an invalid/forged JWT is provided', async () => {
      const res = await request(app)
        .get('/api/clinical/dashboard/stats')
        .set('Authorization', 'Bearer invalid.token.forged');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTH_UNAUTHORIZED');
    });
  });

  describe('2. Role-Based Access Enforcement', () => {
    it('should allow a Doctor to record a consultation', async () => {
      const res = await request(app)
        .post('/api/consultations')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patientId: testPatient._id.toString(),
          appointmentId: testAppointment._id.toString(),
          clinicalObservations: 'Normal vesicular breath sounds. Heart sounds S1, S2 regular.',
          diagnoses: [{ diagnosisName: 'Routine Health Checkup', diagnosisType: 'primary' }],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should forbid a Nurse from creating a clinical consultation (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/consultations')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          patientId: testPatient._id.toString(),
          appointmentId: testAppointment._id.toString(),
          clinicalObservations: 'Nurse notes',
          diagnoses: [{ diagnosisName: 'Self-limiting viral syndrome' }],
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN_INSUFFICIENT_PERMISSIONS');
    });

    it('should forbid a Patient from accessing clinical search or medical records (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/clinical/patients/search?query=Daniel')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN_INSUFFICIENT_PERMISSIONS');
    });

    it('should allow a Nurse to view triage dashboard queue and search patients', async () => {
      const queueRes = await request(app)
        .get('/api/clinical/dashboard/queue')
        .set('Authorization', `Bearer ${nurseToken}`);

      expect(queueRes.status).toBe(200);
      expect(queueRes.body.success).toBe(true);

      const searchRes = await request(app)
        .get('/api/clinical/patients/search?query=Kim')
        .set('Authorization', `Bearer ${nurseToken}`);

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.success).toBe(true);
    });

    it('should forbid a Nurse from amending clinical records (403 Forbidden)', async () => {
      const consult = await Consultation.create({
        patientId: testPatient._id,
        appointmentId: testAppointment._id,
        doctorId: testDoctor._id,
        clinicalObservations: 'Doctor original diagnosis',
        diagnoses: [{ diagnosisName: 'Acute Sinusitis' }],
      });

      const res = await request(app)
        .put(`/api/consultations/${consult._id}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          clinicalObservations: 'Nurse attempted amendment',
          reasonForChange: 'Unauthorized edit',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN_INSUFFICIENT_PERMISSIONS');
    });
  });
});

