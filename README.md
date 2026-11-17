# Centralized Clinic Information System (CCIS)
## Clinical Records Management Module

> **Component:** Clinical Records Management  
> **Team Role:** Senior MERN Stack Software Architect, Full-Stack Developer, UI/UX Designer & Testing Engineer  
> **Repository Branch:** `feature/clinical-records`  
> **Stack:** React.js, Tailwind CSS, Node.js, Express.js, MongoDB, Mongoose, JWT & bcrypt, Jest & Supertest, Postman

---

### Table of Contents
1. [Overview & Scope](#overview--scope)
2. [Component Architecture & Integration Design](#component-architecture--integration-design)
3. [Database Design & Data Models](#database-design--data-models)
4. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
5. [Frontend Interface & Pages](#frontend-interface--pages)
6. [API Specifications](#api-specifications)
7. [Prescription Handoff Protocol](#prescription-handoff-protocol)
8. [Automated Testing Suite](#automated-testing-suite)
9. [Installation & Setup Instructions](#installation--setup-instructions)
10. [Repository File Index](#repository-file-index)

---

### 1. Overview & Scope

The **Centralized Clinic Information System (CCIS)** digitizes medical consultations, patient records, appointments, prescriptions, and pharmacy operations across a university health service clinic. 

As the developer responsible for **Clinical Records Management**, this module delivers a clinical-grade workstation allowing authorized medical doctors and healthcare staff to:
- Monitor daily appointment queues and patients awaiting consultation in real time.
- Search registered students and staff across the shared university patient registry without creating duplicate registration databases.
- Review longitudinal medical histories, past clinical observations, recorded diagnoses, allergies, and past prescriptions.
- Record structured consultation encounters including vital signs (with automatic BMI calculation), chief complaints, symptoms, physical examination findings, doctor notes, and follow-up plans.
- Record primary, secondary, and differential diagnoses non-destructively with ICD-10 clinical coding.
- Enforce controlled, traceable clinical amendments backed by an immutable audit trail.
- Initiate electronic prescription handoffs to Developer 2 (Prescription Management) with bundled patient and diagnosis context.

---

### 2. Component Architecture & Integration Design

```
+-----------------------------------------------------------------------------------+
|                        CENTRALIZED CCIS ARCHITECTURE                              |
+-----------------------------------------------------------------------------------+
                                          |
                +-------------------------+-------------------------+
                |                                                   |
                v                                                   v
+-------------------------------+                   +-------------------------------+
| Module 1: Patient & Appt      |                   | Module 3: Prescriptions       |
| (Developer 1)                 |                   | (Developer 2)                 |
| - Registered Students / Staff |                   | - Electronic Prescriptions    |
| - Scheduled Appointments      |                   | - Dosage & Medication Regimen |
+-------------------------------+                   +-------------------------------+
                |                                                   ^
                | (Inbound Ref: PatientId, ApptId)                  | (Outbound Handoff)
                v                                                   |
+-------------------------------------------------------------------+---------------+
|              MODULE 2: CLINICAL RECORDS MANAGEMENT (OUR MODULE)                   |
|                                                                                   |
|  [ Frontend (React + Tailwind) ]                                                  |
|  * Doctor Dashboard & Triage Queue        * Patient Clinical Search               |
|  * Longitudinal Medical History           * Consultation Recording Form           |
|  * Non-destructive Diagnosis Tool         * Consultation Details & Audit Log      |
|  * Consultation History Archive           * Prescription Handoff Modal            |
|                                                                                   |
|  [ Backend (Node.js + Express + Mongoose) ]                                       |
|  * /api/clinical (Dashboard stats, queue, patient search)                          |
|  * /api/consultations (Create, retrieve, controlled audit amendment)              |
|  * /api/medical-records (Consolidated patient medical summary)                    |
|  * /api/clinical/prescription-handoff (Context bundling & dispatch)               |
|                                                                                   |
|  [ Database Models (ccis_db) ]                                                    |
|  * consultations (Owned)                  * medical_records (Owned)               |
|  * patients (Shared Reference)            * appointments (Shared Reference)       |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
                        +-----------------------------------+
                        | Module 4: Pharmacy & Inventory    |
                        | (Developer 3)                     |
                        | - Dispensation & Stock Control    |
                        +-----------------------------------+
```

---

### 3. Database Design & Data Models

All CCIS modules connect to the single shared MongoDB database (`ccis_db`).

#### Models Owned by Clinical Records Management:
1. **`consultations` collection (`backend/models/Consultation.js`)**:
   - `consultationNumber`: Unique string (e.g. `CNS-882104-4412`).
   - `patientId`: `ObjectId` referencing shared `Patient` collection.
   - `appointmentId`: `ObjectId` referencing shared `Appointment` collection.
   - `doctorId`: `ObjectId` referencing shared `User` collection.
   - `consultationDate`: `Date`.
   - `vitalSigns`: `{ bloodPressure, heartRate, temperature, respiratoryRate, oxygenSaturation, weight, height, bmi }`.
   - `presentingComplaints`: `[{ complaint, duration, severity }]`.
   - `symptoms`: `[String]`.
   - `clinicalObservations`: `String` (Required physical examination findings).
   - `diagnoses`: `[{ diagnosisName, diagnosisCode, diagnosisType, severity, clinicalStatus, notes, recordedAt }]`.
   - `doctorNotes`: `String` (Confidential clinical notes).
   - `followUpRecommendations`: `{ followUpRequired, followUpDate, instructions }`.
   - `prescriptionHandoff`: `{ initiated, initiatedAt, status, handoffNotes, prescriptionId }`.
   - `auditTrail`: `[{ modifiedBy, modifiedByName, modifiedAt, reasonForChange, changesSummary, snapshotBefore }]`.

2. **`medical_records` collection (`backend/models/MedicalRecord.js`)**:
   - `patientId`: `ObjectId` referencing shared `Patient` collection (Unique).
   - `bloodGroup`: `String`.
   - `knownAllergies`: `[{ allergen, category, reaction, severity }]`.
   - `chronicConditions`: `[{ condition, icdCode, diagnosedDate, status }]`.
   - `pastSurgeries`: `[{ procedure, year, hospital }]`.
   - `immunizationRecords`: `[{ vaccineName, administeredDate, doseNumber }]`.
   - `totalClinicVisits`: `Number`.
   - `lastClinicVisit`: `Date`.

---

### 4. Role-Based Access Control (RBAC)

Clinical records contain sensitive personal health information (PHI). Access is enforced through shared JWT verification and backend RBAC middleware:

| Role | Dashboard & Queue | Patient Search | Medical History | Record Consultation | Amend Consultation | Prescription Handoff |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Doctor** | ✅ Full Access | ✅ Allowed | ✅ Full Access | ✅ Allowed | ✅ Allowed (Audited) | ✅ Allowed |
| **Nurse** | ✅ Queue Only | ✅ Allowed | 🔍 Read Baseline | ❌ Forbidden (403) | ❌ Forbidden (403) | ❌ Forbidden (403) |
| **Admin** | ❌ Restricted | ✅ Allowed | ❌ Restricted | ❌ Forbidden (403) | ❌ Forbidden (403) | ❌ Forbidden (403) |
| **Patient** | ❌ Forbidden (403) | ❌ Forbidden (403) | ❌ Forbidden (403) | ❌ Forbidden (403) | ❌ Forbidden (403) | ❌ Forbidden (403) |

---

### 5. Frontend Interface & Pages

The frontend is built with React 18 and Tailwind CSS:

1. **Doctor Dashboard (`/doctor/dashboard`)**: Summary cards (Today's Visits, Queue, Completed), real-time triage queue, quick patient search.
2. **Appointment List (`/doctor/appointments`)**: Schedule filterable by status (`checked-in`, `scheduled`, `in-consultation`, `completed`) and date.
3. **Patient Search (`/doctor/patients`)**: High-speed search matching Patient ID, Student/Staff ID, or Name.
4. **Patient Medical History (`/doctor/patients/:patientId/history`)**: Longitudinal view with allergy warning banners, chronic illnesses, and previous prescription history.
5. **Consultation Form (`/doctor/consultations/new/:appointmentId`)**: Full consultation recording with automatic BMI calculation and field validation.
6. **Diagnosis Form (`/doctor/diagnoses`)**: Standalone tool to append primary/secondary/provisional diagnoses non-destructively.
7. **Consultation Details (`/doctor/consultations/:id`)**: Chronological encounter card, traceable audit trail, and prescription handoff trigger.
8. **Consultation History (`/doctor/consultations/history`)**: Chronological archive with status filters and search.

---

### 6. API Specifications

| Method | Endpoint | Authorized Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/clinical/dashboard/stats` | Doctor, Nurse, Admin | Fetch metrics for doctor dashboard |
| `GET` | `/api/clinical/dashboard/queue` | Doctor, Nurse | Real-time triage appointment queue |
| `GET` | `/api/clinical/patients/search` | Doctor, Nurse, Admin | Search registered patients by ID or name |
| `POST` | `/api/consultations` | Doctor | Record and finalize a clinical consultation |
| `GET` | `/api/consultations/:id` | Doctor, Nurse, Admin | Get consultation details by ID |
| `GET` | `/api/consultations/patient/:patientId` | Doctor, Nurse, Admin | Get chronological history for patient |
| `PUT` | `/api/consultations/:id` | Doctor | Controlled amendment with audit trail |
| `PATCH` | `/api/consultations/:id/diagnoses` | Doctor | Append diagnosis without overwriting |
| `GET` | `/api/medical-records/patient/:patientId` | Doctor, Nurse, Admin | Full patient longitudinal medical file |
| `PUT` | `/api/medical-records/patient/:patientId/summary` | Doctor, Nurse | Update baseline clinical risk indicators |
| `POST` | `/api/clinical/prescription-handoff` | Doctor | Initiate prescription handoff to Module 3 |
| `GET` | `/api/clinical/prescription-handoff/:consultationId/status` | Doctor, Nurse, Admin | Check prescription handoff status |

---

### 7. Prescription Handoff Protocol

To initiate the prescription workflow without creating duplicate prescription tables:
1. Doctor finishes consultation and reviews recorded diagnoses.
2. Doctor clicks **"Initiate Prescription Workflow"**.
3. Backend validates that the consultation has at least one recorded diagnosis and bundles patient demographics, diagnoses, vital signs, and allergy contraindications into a standard payload.
4. Consultation status is updated to `pending_rx_creation`, and the frontend transfers the context to the Prescription Management Module via deep link:
   ```
   /prescriptions/new?consultationId=664c3f2e1a90c40134567890&patientId=664c3e1b1a90c40134567811
   ```

---

### 8. Automated Testing Suite

Automated integration tests are built with **Jest** and **Supertest** covering all mandatory requirements:
- `backend/tests/consultation.test.js`:
  - Valid consultation creation and appointment completion update.
  - Required-field validation (fails with 400 when clinical observations, diagnoses, or IDs are missing).
  - Duplicate consultation prevention for the same appointment (fails with 409).
  - Non-destructive diagnosis recording (preserves existing diagnoses).
  - Controlled record amendment requiring reason for change.
  - Prescription handoff initiation and payload generation.
- `backend/tests/medicalRecord.test.js`:
  - Patient search by Student ID, Staff ID, and Name.
  - Consolidated medical history retrieval (allergies, consultation timeline, previous prescriptions).
  - Chronological consultation history retrieval.
- `backend/tests/rbac.test.js`:
  - Unauthorized access prevention (missing token -> 401, invalid token -> 401).
  - Doctor authorized for clinical creation and amendment.
  - Nurse restricted from creating consultations or amending diagnoses (403).
  - Patient forbidden from accessing clinical search or medical records (403).

---

### 9. Installation & Setup Instructions

#### Prerequisites
- Node.js >= 18.0.0
- MongoDB instance running locally on `mongodb://localhost:27017/ccis_db` or MongoDB Atlas URI.

#### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

#### 2. Run Automated Tests
```bash
cd backend
npm test
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

### 10. Repository File Index

```
centralized-clinic-information-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validate.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Consultation.js
│   │   ├── MedicalRecord.js
│   │   └── shared/
│   │       ├── Patient.js
│   │       ├── Appointment.js
│   │       ├── User.js
│   │       └── Prescription.js
│   ├── controllers/
│   │   ├── clinicalDashboardController.js
│   │   ├── consultationController.js
│   │   ├── medicalRecordController.js
│   │   └── prescriptionHandoffController.js
│   ├── services/
│   │   ├── consultationService.js
│   │   └── medicalRecordService.js
│   ├── routes/
│   │   ├── clinicalRoutes.js
│   │   ├── consultationRoutes.js
│   │   ├── medicalRecordRoutes.js
│   │   ├── prescriptionHandoffRoutes.js
│   │   └── index.js
│   ├── tests/
│   │   ├── setup.js
│   │   ├── consultation.test.js
│   │   ├── medicalRecord.test.js
│   │   └── rbac.test.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── AlertBanner.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── LoadingSkeleton.jsx
│   │   │   │   └── Modal.jsx
│   │   │   ├── clinical/
│   │   │   │   ├── ConsultationTimeline.jsx
│   │   │   │   ├── DiagnosisBadge.jsx
│   │   │   │   ├── PrescriptionHandoffCard.jsx
│   │   │   │   ├── VitalSignsDisplay.jsx
│   │   │   │   └── VitalSignsInput.jsx
│   │   │   └── navigation/
│   │   │       └── DoctorNavbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── AppointmentList.jsx
│   │   │   ├── PatientSearch.jsx
│   │   │   ├── PatientMedicalHistory.jsx
│   │   │   ├── ConsultationForm.jsx
│   │   │   ├── DiagnosisForm.jsx
│   │   │   ├── ConsultationDetails.jsx
│   │   │   └── ConsultationHistory.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── clinicalService.js
│   │   │   └── mockSharedData.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── INTEGRATION_GUIDE.md
│   └── ccis_clinical_records.postman_collection.json
└── README.md
```
