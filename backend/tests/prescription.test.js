const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

const app = require('../server');
const Prescription = require('../models/Prescription');
const Medicine = require('../models/Medicine');

let mongoServer;
const JWT_SECRET = 'ccis_shared_jwt_super_secret_key_development_only';

// Helper tokens for roles
const doctorUser = { id: new mongoose.Types.ObjectId().toString(), name: 'Dr. John Mensah', role: 'doctor' };
const pharmacistUser = { id: new mongoose.Types.ObjectId().toString(), name: 'Pharm. Sarah Boateng', role: 'pharmacist' };
const nurseUser = { id: new mongoose.Types.ObjectId().toString(), name: 'Nurse Grace Osei', role: 'nurse' };

const doctorToken = jwt.sign(doctorUser, JWT_SECRET, { expiresIn: '1h' });
const pharmacistToken = jwt.sign(pharmacistUser, JWT_SECRET, { expiresIn: '1h' });
const nurseToken = jwt.sign(nurseUser, JWT_SECRET, { expiresIn: '1h' });

let testMedicine1;
let testMedicine2;
const testPatientId = new mongoose.Types.ObjectId().toString();
const testConsultationId = new mongoose.Types.ObjectId().toString();

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Seed test medicines in shared catalogue
  testMedicine1 = await Medicine.create({
    code: 'MED-001',
    name: 'Amoxicillin Trihydrate',
    genericName: 'Amoxicillin',
    category: 'Antibiotics',
    strength: '500mg',
    form: 'Capsule',
    currentStock: 150,
    isActive: true
  });

  testMedicine2 = await Medicine.create({
    code: 'MED-002',
    name: 'Paracetamol BP',
    genericName: 'Acetaminophen',
    category: 'Analgesics',
    strength: '500mg',
    form: 'Tablet',
    currentStock: 300,
    isActive: true
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Prescription.deleteMany({});
});

describe('CCIS Prescription Management Module Test Suite', () => {
  /* ==========================================================================
     1. PRESCRIPTION CREATION TESTS
     ========================================================================== */
  describe('POST /api/prescriptions - Prescription Creation', () => {
    it('TEST-01: Should allow authorized doctor to create a prescription successfully', async () => {
      const payload = {
        patientId: testPatientId,
        patientName: 'Kofi Mensah',
        patientIdentifier: 'STU-2024-8841',
        consultationId: testConsultationId,
        clinicalDiagnosis: 'Acute Bronchitis',
        generalInstructions: 'Drink plenty of fluids and rest',
        items: [
          {
            medicineId: testMedicine1._id.toString(),
            medicineName: testMedicine1.name,
            strength: testMedicine1.strength,
            form: testMedicine1.form,
            dosage: '1 capsule',
            frequency: 'Three times daily (TDS)',
            duration: '7 days',
            quantityPrescribed: 21,
            instructions: 'Take after meals'
          }
        ]
      };

      const res = await request(app)
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.prescriptionNumber).toMatch(/^RX-\d{6}-\d{4}$/);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].quantityDispensed).toBe(0);
      expect(res.body.data.auditTrail).toHaveLength(1);
      expect(res.body.data.auditTrail[0].action).toBe('created');
    });

    it('TEST-02: Should reject prescription creation when required fields are missing', async () => {
      const invalidPayload = {
        patientName: 'Incomplete Patient'
        // Missing patientId and items
      };

      const res = await request(app)
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('TEST-03: Should reject prescription creation with empty items array', async () => {
      const payload = {
        patientId: testPatientId,
        items: []
      };

      const res = await request(app)
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('TEST-04: Should reject medicine that does not exist in shared catalogue', async () => {
      const fakeMedicineId = new mongoose.Types.ObjectId().toString();
      const payload = {
        patientId: testPatientId,
        items: [
          {
            medicineId: fakeMedicineId,
            medicineName: 'Ghost Medicine',
            strength: '100mg',
            form: 'Tablet',
            dosage: '1 tablet',
            frequency: 'Once daily (OD)',
            duration: '3 days',
            quantityPrescribed: 3
          }
        ]
      };

      const res = await request(app)
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('do not exist or are inactive');
    });
  });

  /* ==========================================================================
     2. AUTHORIZATION & SECURITY TESTS
     ========================================================================== */
  describe('Security & Role-Based Access Control (RBAC)', () => {
    it('TEST-05: Should deny prescription creation for unauthorized roles (Nurse/Pharmacist)', async () => {
      const payload = {
        patientId: testPatientId,
        items: [
          {
            medicineId: testMedicine1._id.toString(),
            medicineName: testMedicine1.name,
            strength: testMedicine1.strength,
            form: testMedicine1.form,
            dosage: '1 capsule',
            frequency: 'Once daily (OD)',
            duration: '5 days',
            quantityPrescribed: 5
          }
        ]
      };

      // Attempt as Nurse
      const nurseRes = await request(app)
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send(payload);

      expect(nurseRes.status).toBe(403);
      expect(nurseRes.body.message).toContain('Forbidden');

      // Attempt as Pharmacist
      const pharmRes = await request(app)
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${pharmacistToken}`)
        .send(payload);

      expect(pharmRes.status).toBe(403);
    });

    it('TEST-06: Should deny access when no valid JWT is provided', async () => {
      const res = await request(app).get('/api/prescriptions');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  /* ==========================================================================
     3. RETRIEVAL & DASHBOARD STATS TESTS
     ========================================================================== */
  describe('GET /api/prescriptions & Dashboard Stats', () => {
    beforeEach(async () => {
      // Seed two prescriptions
      await Prescription.create([
        {
          prescriptionNumber: 'RX-202611-0001',
          patientId: testPatientId,
          patientName: 'Kofi Mensah',
          doctorId: doctorUser.id,
          status: 'pending',
          items: [
            {
              medicineId: testMedicine1._id,
              medicineName: testMedicine1.name,
              strength: testMedicine1.strength,
              form: testMedicine1.form,
              dosage: '1 capsule',
              frequency: 'Three times daily (TDS)',
              duration: '5 days',
              quantityPrescribed: 15
            }
          ]
        },
        {
          prescriptionNumber: 'RX-202611-0002',
          patientId: new mongoose.Types.ObjectId(),
          patientName: 'Ama Serwaa',
          doctorId: doctorUser.id,
          status: 'fulfilled',
          items: [
            {
              medicineId: testMedicine2._id,
              medicineName: testMedicine2.name,
              strength: testMedicine2.strength,
              form: testMedicine2.form,
              dosage: '2 tablets',
              frequency: 'Twice daily (BD)',
              duration: '3 days',
              quantityPrescribed: 12,
              quantityDispensed: 12,
              itemStatus: 'dispensed'
            }
          ]
        }
      ]);
    });

    it('TEST-07: Should retrieve list of prescriptions with pagination and filtering', async () => {
      const res = await request(app)
        .get('/api/prescriptions?status=pending')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].prescriptionNumber).toBe('RX-202611-0001');
    });

    it('TEST-08: Should return dashboard aggregate statistics', async () => {
      const res = await request(app)
        .get('/api/prescriptions/dashboard-stats')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.pending).toBe(1);
      expect(res.body.data.fulfilled).toBe(1);
    });

    it('TEST-09: Should retrieve prescription history for a specific patient', async () => {
      const res = await request(app)
        .get(`/api/prescriptions/patient/${testPatientId}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].patientName).toBe('Kofi Mensah');
    });
  });

  /* ==========================================================================
     4. CONTROLLED UPDATE & DISPENSING INTEGRATION TESTS
     ========================================================================== */
  describe('Controlled Updates & Pharmacy Dispensing Integration', () => {
    let pendingRx;

    beforeEach(async () => {
      pendingRx = await Prescription.create({
        prescriptionNumber: 'RX-202611-0003',
        patientId: testPatientId,
        patientName: 'Kwame Osei',
        doctorId: doctorUser.id,
        status: 'pending',
        items: [
          {
            medicineId: testMedicine1._id,
            medicineName: testMedicine1.name,
            strength: testMedicine1.strength,
            form: testMedicine1.form,
            dosage: '1 capsule',
            frequency: 'Three times daily (TDS)',
            duration: '7 days',
            quantityPrescribed: 21,
            quantityDispensed: 0,
            itemStatus: 'pending'
          },
          {
            medicineId: testMedicine2._id,
            medicineName: testMedicine2.name,
            strength: testMedicine2.strength,
            form: testMedicine2.form,
            dosage: '2 tablets',
            frequency: 'Twice daily (BD)',
            duration: '3 days',
            quantityPrescribed: 12,
            quantityDispensed: 0,
            itemStatus: 'pending'
          }
        ]
      });
    });

    it('TEST-10: Doctor can update prescription when status is pending', async () => {
      const updatePayload = {
        reason: 'Adjusted duration following lab test results',
        generalInstructions: 'Updated instructions: Take after food',
        items: [
          {
            medicineId: testMedicine1._id.toString(),
            medicineName: testMedicine1.name,
            strength: testMedicine1.strength,
            form: testMedicine1.form,
            dosage: '1 capsule',
            frequency: 'Three times daily (TDS)',
            duration: '10 days',
            quantityPrescribed: 30
          }
        ]
      };

      const res = await request(app)
        .put(`/api/prescriptions/${pendingRx._id}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.data.items[0].quantityPrescribed).toBe(30);
      expect(res.body.data.auditTrail.length).toBeGreaterThan(0);
      expect(res.body.data.auditTrail.some((a) => a.action === 'updated_before_dispense')).toBe(true);
    });

    it('TEST-11: Pharmacy Handoff - Pharmacist records partial dispensing', async () => {
      const dispensePayload = {
        status: 'partially_dispensed',
        dispensingNotes: 'Amoxicillin dispensed; Paracetamol awaiting restock',
        itemsDispensed: [
          {
            medicineId: testMedicine1._id.toString(),
            quantityDispensed: 21,
            batchNumber: 'BAT-2026-99'
          },
          {
            medicineId: testMedicine2._id.toString(),
            quantityDispensed: 0,
            itemStatus: 'backordered'
          }
        ]
      };

      const res = await request(app)
        .patch(`/api/prescriptions/${pendingRx._id}/dispense-status`)
        .set('Authorization', `Bearer ${pharmacistToken}`)
        .send(dispensePayload);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('partially_dispensed');
      expect(res.body.data.items[0].itemStatus).toBe('dispensed');
      expect(res.body.data.items[1].itemStatus).toBe('backordered');
      expect(res.body.data.dispensingHistory).toHaveLength(1);
    });

    it('TEST-12: STATE GUARD - Doctor cannot edit prescription once dispensing has commenced', async () => {
      // Simulate that prescription was partially dispensed
      pendingRx.status = 'partially_dispensed';
      await pendingRx.save();

      const updatePayload = {
        reason: 'Attempted modification after pharmacy start',
        generalInstructions: 'Disallowed change'
      };

      const res = await request(app)
        .put(`/api/prescriptions/${pendingRx._id}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(updatePayload);

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('strictly prohibited once pharmacy dispensing has commenced');
    });

    it('TEST-13: INTEGRITY GUARD - Reject marking prescription as fulfilled when items remain pending/backordered', async () => {
      const invalidFulfillmentPayload = {
        status: 'fulfilled', // Falsely claiming fulfilled
        dispensingNotes: 'Claimed fulfilled but only 1 of 2 items dispensed',
        itemsDispensed: [
          {
            medicineId: testMedicine1._id.toString(),
            quantityDispensed: 21
          },
          {
            medicineId: testMedicine2._id.toString(),
            quantityDispensed: 0,
            itemStatus: 'backordered'
          }
        ]
      };

      const res = await request(app)
        .patch(`/api/prescriptions/${pendingRx._id}/dispense-status`)
        .set('Authorization', `Bearer ${pharmacistToken}`)
        .send(invalidFulfillmentPayload);

      expect(res.status).toBe(422);
      expect(res.body.message).toContain('Integrity rule violation');
    });
  });
});
