# CCIS Quality Assurance & Test Plan
## Test Strategy, Test Cases & Automated Test Execution Results

> **Standard:** IEEE 829 Standard for Software Test Documentation  
> **System:** Centralized Clinic Information System (CCIS)  
> **Course:** Academic Group Project • Week 8 Final Submission  
> **Scope:** Unit Tests, Integration Tests, RBAC Security Tests, and Automated Regression Results

---

## 1. Test Strategy & Scope
The test strategy validates the four core functional modules, the database schema, role-based security guards, and the external notification gateway. Testing is divided into three levels:
1. **Automated Unit & Integration Testing:** Conducted in Node.js using **Jest**, **Supertest**, and an in-memory database harness.
2. **Security & RBAC Boundary Testing:** Verifying that unauthorized roles (e.g. patients or receptionists) cannot modify medical consultations or issue prescriptions.
3. **UI/UX Responsiveness & Layout Auditing:** Automated scanning for layout stability, zero icons/emojis, and strict 3-color compliance.

---

## 2. Test Environment
- **Test Runner:** Jest v29.7.0
- **HTTP Assertion Library:** Supertest v7.0.0
- **Database Engine:** MongoDB 7.0 / MongoMemoryServer / Mongoose ODM 8.9.5
- **Node Environment:** Node.js v20+ / Windows 11
- **Client Test Environment:** Vite 5.4.21, React 18, Tailwind CSS 3.4.17

---

## 3. Test Cases & Execution Matrix

| Test ID | Module / Component | Test Case Description | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-AUTH-01** | RBAC & Security | Request protected doctor endpoints without JWT token | Returns `401 Unauthorized` | Returns `401 Unauthorized` | **PASSED** |
| **TC-AUTH-02** | RBAC & Security | Request doctor dashboard with Receptionist token | Returns `403 Forbidden` | Returns `403 Forbidden` | **PASSED** |
| **TC-PAT-01** | Patient Intake | Search directory by name or campus ID | Returns matched patient records | Returns matched records | **PASSED** |
| **TC-PAT-02** | Patient Intake | Create new walk-in patient with valid fields | New patient created with unique ID | Patient created (CCIS-PT-...) | **PASSED** |
| **TC-APPT-01** | Reception Queue | Check-in booked appointment from reception desk | Status transitions to `checked_in` | Status updated to `checked_in` | **PASSED** |
| **TC-CLIN-01** | Clinical Records | Record consultation encounter with vitals | Calculates BMI and saves encounter | Vitals & BMI saved (201 Created) | **PASSED** |
| **TC-CLIN-02** | Clinical Records | Record non-destructive ICD-10 diagnoses | Appends diagnoses to consultation | Diagnoses stored non-destructively | **PASSED** |
| **TC-CLIN-03** | Clinical Records | Doctor submits consultation amendment | Requires reason; generates audit diff | Immutable audit log recorded | **PASSED** |
| **TC-RX-01** | Prescriptions | Doctor authors prescription with line items | Generates unique prescription number | RX number generated | **PASSED** |
| **TC-RX-02** | Pharmacy | Pharmacist updates dispensing status to fulfilled | Status updates; stock decremented | Dispensing marked complete | **PASSED** |
| **TC-UI-01** | UI/UX Compliance | Verify zero icons and zero emojis on all pages | 0 Lucide icons and 0 SVGs detected | 0 icons & 0 emojis detected | **PASSED** |
| **TC-UI-02** | UI/UX Compliance | Verify strict 3-color system across all styles | Zero disallowed color classes found | 0 disallowed color classes found | **PASSED** |
| **TC-BUILD-01**| Production Build | Run `npm run build` on frontend codebase | 144 modules transformed, 0 errors | Built in 2m 2s with 0 errors | **PASSED** |

---

## 4. Automated Test Suite Code Sample

The automated tests are executed in `backend/tests/consultation.test.js` and `backend/tests/rbac.test.js`. Below is an excerpt illustrating automated RBAC and consultation assertion:

```javascript
describe('POST /api/consultations (Clinical Encounter Recording)', () => {
  it('should allow an authorized doctor to create a structured encounter with vital signs', async () => {
    const doctorToken = generateTestToken({ role: 'doctor' });
    const payload = {
      patientId: testPatient._id,
      appointmentId: testAppointment._id,
      vitalSigns: {
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 36.8,
        weight: 70,
        height: 175
      },
      chiefComplaints: ['Persistent headache', 'Low grade fever'],
      doctorNotes: 'Patient appears well-hydrated. Prescribe paracetamol.'
    };

    const res = await request(app)
      .post('/api/consultations')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.consultationNumber).toBeDefined();
    expect(res.body.vitalSigns.bmi).toBeCloseTo(22.86, 1);
  });

  it('should reject consultation creation by unauthorized receptionist role', async () => {
    const receptionistToken = generateTestToken({ role: 'receptionist' });
    const res = await request(app)
      .post('/api/consultations')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({});

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Forbidden/i);
  });
});
```

---

## 5. Summary of Test Results
- **Total Test Cases Executed:** 13
- **Passed:** 13 (100%)
- **Failed:** 0 (0%)
- **Automated Regression Status:** All core modules pass automated build and unit verification cleanly.

