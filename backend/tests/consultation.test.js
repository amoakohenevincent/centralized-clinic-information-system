const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const { connectTestDB, clearTestDB, closeTestDB, generateTestToken } = require('./setup');

const Patient = require('../models/shared/Patient');
const Appointment = require('../models/shared/Appointment');
const User = require('../models/shared/User');
const Consultation = require('../models/Consultation');

describe('Clinical Records Management — Consultation & Diagnosis Tests', () => {
  let doctorToken;
  let testDoctor;
  let testPatient;
  let testAppointment;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    // Seed test doctor user
    testDoctor = await User.create({
      username: 'dr_jenkins',
      email: 'dr.jenkins@clinic.university.edu',
      password: 'hashed_password_placeholder',
      role: 'doctor',
      title: 'Dr.',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      specialization: 'Internal Medicine',
      medicalLicenseNumber: 'MD-88319',
    });

    doctorToken = generateTestToken({
      _id: testDoctor._id,
      username: testDoctor.username,
      role: 'doctor',
      firstName: testDoctor.firstName,
      lastName: testDoctor.lastName,
    });

    // Seed test patient
    testPatient = await Patient.create({
      patientId: 'PAT-2026-0001',
      universityId: 'STU-2023-4412',
      patientType: 'student',
      firstName: 'Alex',
      lastName: 'Rivera',
      email: 'alex.rivera@student.university.edu',
      phoneNumber: '+1-555-0199',
      dateOfBirth: new Date('2003-05-14'),
      gender: 'male',
      bloodGroup: 'O+',
      department: 'Faculty of Science',
    });

    // Seed test appointment
    testAppointment = await Appointment.create({
      appointmentNumber: 'APT-2026-0100',
      patientId: testPatient._id,
      doctorId: testDoctor._id,
      appointmentDate: new Date(),
      appointmentTime: '09:00 AM',
      appointmentType: 'routine',
      status: 'checked-in',
      reasonForVisit: 'Severe sore throat and fatigue for 3 days',
      queueNumber: 1,
    });
  });

  describe('1. Consultation Creation & Field Validation', () => {
    it('should create a valid consultation and update appointment status to completed', async () => {
      const consultationPayload = {
        patientId: testPatient._id.toString(),
        appointmentId: testAppointment._id.toString(),
        clinicalObservations: 'Bilateral tonsillar exudates, pharyngeal erythema, tender anterior cervical lymph nodes.',
        vitalSigns: {
          bloodPressure: '122/78',
          heartRate: 84,
          temperature: 38.6,
          oxygenSaturation: 98,
          weight: 70,
          height: 175,
        },
        presentingComplaints: [
          { complaint: 'Sore throat and difficulty swallowing', duration: '3 days', severity: 'severe' },
        ],
        symptoms: ['Fever', 'Sore Throat', 'Fatigue'],
        diagnoses: [
          {
            diagnosisName: 'Acute Streptococcal Pharyngitis',
            diagnosisCode: 'J02.0',
            diagnosisType: 'primary',
            severity: 'moderate',
            notes: 'Rapid Strep positive',
          },
        ],
        doctorNotes: 'Prescribed warm salt water gargle, analgesics, and rest.',
        followUpRecommendations: {
          followUpRequired: true,
          followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          instructions: 'Return if fever persists beyond 48 hours.',
        },
      };

      const res = await request(app)
        .post('/api/consultations')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(consultationPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.consultationNumber).toMatch(/^CNS-/);
      expect(res.body.data.vitalSigns.bmi).toBe(22.9); // Calculated BMI
      expect(res.body.data.diagnoses).toHaveLength(1);
      expect(res.body.data.diagnoses[0].diagnosisName).toBe('Acute Streptococcal Pharyngitis');

      // Verify shared appointment was updated to completed
      const updatedAppt = await Appointment.findById(testAppointment._id);
      expect(updatedAppt.status).toBe('completed');
    });

    it('should fail validation with 400 when required fields are missing', async () => {
      const incompletePayload = {
        patientId: testPatient._id.toString(),
        // missing appointmentId, clinicalObservations, diagnoses
      };

      const res = await request(app)
        .post('/api/consultations')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(incompletePayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
      expect(res.body.error.details.length).toBeGreaterThanOrEqual(3);
    });

    it('should prevent creating duplicate consultations for the same appointment', async () => {
      // First consultation
      await Consultation.create({
        patientId: testPatient._id,
        appointmentId: testAppointment._id,
        doctorId: testDoctor._id,
        clinicalObservations: 'First consultation findings',
        diagnoses: [{ diagnosisName: 'Common Cold', diagnosisType: 'primary' }],
      });

      // Second consultation attempt
      const res = await request(app)
        .post('/api/consultations')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patientId: testPatient._id.toString(),
          appointmentId: testAppointment._id.toString(),
          clinicalObservations: 'Second consultation attempt',
          diagnoses: [{ diagnosisName: 'Influenza', diagnosisType: 'primary' }],
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONSULTATION_ALREADY_EXISTS');
    });
  });

  describe('2. Diagnosis Recording & Non-Destructive Storage', () => {
    it('should append new diagnoses to an existing consultation without overwriting previous diagnoses', async () => {
      // Create initial consultation with primary diagnosis
      const consultation = await Consultation.create({
        patientId: testPatient._id,
        appointmentId: testAppointment._id,
        doctorId: testDoctor._id,
        clinicalObservations: 'Initial consultation baseline',
        diagnoses: [
          {
            diagnosisName: 'Hypertension Stage 1',
            diagnosisCode: 'I10',
            diagnosisType: 'primary',
            severity: 'moderate',
          },
        ],
      });

      // Append secondary diagnosis via PATCH /api/consultations/:id/diagnoses
      const res = await request(app)
        .patch(`/api/consultations/${consultation._id}/diagnoses`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          diagnosisName: 'Type 2 Diabetes Mellitus',
          diagnosisCode: 'E11.9',
          diagnosisType: 'secondary',
          severity: 'moderate',
          clinicalStatus: 'active',
          notes: 'Fasting glucose elevated to 142 mg/dL',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.diagnoses).toHaveLength(2);
      expect(res.body.data.diagnoses[0].diagnosisName).toBe('Hypertension Stage 1');
      expect(res.body.data.diagnoses[1].diagnosisName).toBe('Type 2 Diabetes Mellitus');

      // Audit trail should trace the diagnosis addition
      expect(res.body.data.auditTrail.length).toBeGreaterThan(0);
    });
  });

  describe('3. Controlled Clinical Record Amendment', () => {
    it('should allow controlled amendment with mandatory reason for change and audit log', async () => {
      const consultation = await Consultation.create({
        patientId: testPatient._id,
        appointmentId: testAppointment._id,
        doctorId: testDoctor._id,
        clinicalObservations: 'Initial draft observations',
        diagnoses: [{ diagnosisName: 'Viral Bronchitis', diagnosisType: 'primary' }],
      });

      const res = await request(app)
        .put(`/api/consultations/${consultation._id}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          clinicalObservations: 'Revised observation: Coarse crackles noted on right lower lung base.',
          reasonForChange: 'Updated after reviewing chest X-ray findings.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('amended');
      expect(res.body.data.clinicalObservations).toContain('Coarse crackles');
      expect(res.body.data.auditTrail[0].reasonForChange).toBe('Updated after reviewing chest X-ray findings.');
    });

    it('should reject amendment if reasonForChange is missing', async () => {
      const consultation = await Consultation.create({
        patientId: testPatient._id,
        appointmentId: testAppointment._id,
        doctorId: testDoctor._id,
        clinicalObservations: 'Observations',
        diagnoses: [{ diagnosisName: 'Migraine', diagnosisType: 'primary' }],
      });

      const res = await request(app)
        .put(`/api/consultations/${consultation._id}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          clinicalObservations: 'New observations without reason',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('4. Prescription Handoff Workflow', () => {
    it('should generate standard handoff payload for Prescription Management module', async () => {
      const consultation = await Consultation.create({
        patientId: testPatient._id,
        appointmentId: testAppointment._id,
        doctorId: testDoctor._id,
        clinicalObservations: 'Acute tonsillitis with 39C fever.',
        vitalSigns: { bloodPressure: '118/76', heartRate: 88, temperature: 39.0 },
        diagnoses: [
          { diagnosisName: 'Acute Tonsillitis', diagnosisCode: 'J03.90', diagnosisType: 'primary' },
        ],
      });

      const res = await request(app)
        .post('/api/clinical/prescription-handoff')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          consultationId: consultation._id.toString(),
          handoffNotes: 'Start Amoxicillin-Clavulanate for 7 days.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('consultationId', consultation._id.toString());
      expect(res.body.data.patient).toHaveProperty('patientId', 'PAT-2026-0001');
      expect(res.body.data.doctor).toHaveProperty('licenseNumber', 'MD-88319');
      expect(res.body.data.diagnoses[0].diagnosisName).toBe('Acute Tonsillitis');
      expect(res.body.data.redirectUrl).toContain(`/prescriptions/new?consultationId=${consultation._id}`);

      // Verify consultation prescription handoff status updated
      const updated = await Consultation.findById(consultation._id);
      expect(updated.prescriptionHandoff.initiated).toBe(true);
      expect(updated.prescriptionHandoff.status).toBe('pending_rx_creation');
    });
  });
});

