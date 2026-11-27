const request = require('supertest');
const app = require('../server');
const { connectTestDB, clearTestDB, closeTestDB, generateTestToken } = require('./setup');

const Patient = require('../models/shared/Patient');
const Appointment = require('../models/shared/Appointment');
const User = require('../models/shared/User');
const Consultation = require('../models/Consultation');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/shared/Prescription');

describe('Clinical Records Management — Medical History & Patient Search Tests', () => {
  let doctorToken;
  let testDoctor;
  let testPatient1;
  let testPatient2;

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

    doctorToken = generateTestToken({
      _id: testDoctor._id,
      role: 'doctor',
    });

    testPatient1 = await Patient.create({
      patientId: 'PAT-2026-0001',
      universityId: 'STU-2024-9988',
      patientType: 'student',
      firstName: 'Ama',
      lastName: 'Serwaa',
      email: 'ama.serwaa@st.ug.edu.gh',
      dateOfBirth: new Date('2002-09-12'),
      gender: 'female',
      bloodGroup: 'B+',
      department: 'Department of Computer Science',
    });

    testPatient2 = await Patient.create({
      patientId: 'PAT-2026-0002',
      universityId: 'EMP-2019-1002',
      patientType: 'staff',
      firstName: 'Kwame',
      lastName: 'Boateng',
      email: 'kwame.boateng@ug.edu.gh',
      dateOfBirth: new Date('1985-04-22'),
      gender: 'male',
      bloodGroup: 'O-',
      department: 'Department of Chemistry',
    });

    // Seed baseline medical record for patient 1
    await MedicalRecord.create({
      patientId: testPatient1._id,
      bloodGroup: 'B+',
      knownAllergies: [
        { allergen: 'Penicillin', category: 'drug', reaction: 'Anaphylaxis', severity: 'life-threatening' },
      ],
      chronicConditions: [
        { condition: 'Bronchial Asthma', status: 'managed', diagnosedDate: new Date('2018-01-01') },
      ],
      totalClinicVisits: 2,
    });
  });

  describe('1. Patient Search', () => {
    it('should search patients by Student University ID', async () => {
      const res = await request(app)
        .get('/api/clinical/patients/search?query=STU-2024-9988')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].universityId).toBe('STU-2024-9988');
      expect(res.body.data[0].fullName).toBe('Maria Santos');
    });

    it('should search patients by Staff University ID', async () => {
      const res = await request(app)
        .get('/api/clinical/patients/search?query=EMP-2019-1002')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].universityId).toBe('EMP-2019-1002');
      expect(res.body.data[0].patientType).toBe('staff');
    });

    it('should search patients by Name substring', async () => {
      const res = await request(app)
        .get('/api/clinical/patients/search?query=Chen')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].lastName).toBe('Chen');
    });
  });

  describe('2. Patient Medical History Retrieval', () => {
    it('should retrieve consolidated medical history with allergies, timeline, and prescriptions', async () => {
      // Create mock appointment and consultation
      const appt = await Appointment.create({
        appointmentNumber: 'APT-2026-0001',
        patientId: testPatient1._id,
        doctorId: testDoctor._id,
        appointmentDate: new Date('2026-11-10'),
        appointmentTime: '10:00 AM',
        status: 'completed',
      });

      const consult = await Consultation.create({
        patientId: testPatient1._id,
        appointmentId: appt._id,
        doctorId: testDoctor._id,
        consultationDate: new Date('2026-11-10'),
        clinicalObservations: 'Wheezing on expiration, mild dyspnea.',
        diagnoses: [
          {
            diagnosisName: 'Acute Asthma Exacerbation',
            diagnosisCode: 'J45.901',
            diagnosisType: 'primary',
            severity: 'moderate',
          },
        ],
      });

      // Seed past prescription
      await Prescription.create({
        prescriptionNumber: 'RX-2026-0099',
        consultationId: consult._id,
        patientId: testPatient1._id,
        doctorId: testDoctor._id,
        medications: [
          { medicationName: 'Salbutamol Inhaler', dosage: '100mcg', frequency: '2 puffs PRN', duration: '30 days' },
        ],
      });

      const res = await request(app)
        .get(`/api/medical-records/patient/${testPatient1._id}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.patient.patientId).toBe('PAT-2026-0001');
      expect(res.body.data.summary.knownAllergies[0].allergen).toBe('Penicillin');
      expect(res.body.data.consultationsTimeline).toHaveLength(1);
      expect(res.body.data.recordedDiagnosesHistory[0].diagnosisName).toBe('Acute Asthma Exacerbation');
      expect(res.body.data.previousPrescriptions).toHaveLength(1);
      expect(res.body.data.previousPrescriptions[0].prescriptionNumber).toBe('RX-2026-0099');
    });

    it('should return 404 if patient does not exist', async () => {
      const nonExistentId = new User()._id;
      const res = await request(app)
        .get(`/api/medical-records/patient/${nonExistentId}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PATIENT_NOT_FOUND');
    });
  });

  describe('3. Consultation History Retrieval', () => {
    it('should retrieve paginated chronological consultation history', async () => {
      const appt1 = await Appointment.create({
        appointmentNumber: 'APT-1',
        patientId: testPatient1._id,
        doctorId: testDoctor._id,
        appointmentDate: new Date('2026-10-01'),
        appointmentTime: '09:00 AM',
        status: 'completed',
      });
      const appt2 = await Appointment.create({
        appointmentNumber: 'APT-2',
        patientId: testPatient1._id,
        doctorId: testDoctor._id,
        appointmentDate: new Date('2026-11-01'),
        appointmentTime: '11:00 AM',
        status: 'completed',
      });

      await Consultation.create([
        {
          patientId: testPatient1._id,
          appointmentId: appt1._id,
          doctorId: testDoctor._id,
          consultationDate: new Date('2026-10-01'),
          clinicalObservations: 'First visit notes',
          diagnoses: [{ diagnosisName: 'Allergic Rhinitis' }],
        },
        {
          patientId: testPatient1._id,
          appointmentId: appt2._id,
          doctorId: testDoctor._id,
          consultationDate: new Date('2026-11-01'),
          clinicalObservations: 'Second visit notes',
          diagnoses: [{ diagnosisName: 'Seasonal Conjunctivitis' }],
        },
      ]);

      const res = await request(app)
        .get(`/api/consultations/patient/${testPatient1._id}?sort=desc`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
      // Newest consultation should appear first
      expect(new Date(res.body.data[0].consultationDate).getTime()).toBeGreaterThan(
        new Date(res.body.data[1].consultationDate).getTime()
      );
    });
  });
});

