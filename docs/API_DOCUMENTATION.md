# CCIS Clinical Records Management — API Documentation
## Centralized Clinic Information System (CCIS)

### Base URL
- Production: `https://clinic.university.edu/api`
- Development: `http://localhost:5000/api`

### Authentication & Authorization
All endpoints (except `/health`) require a valid JSON Web Token (JWT) in the `Authorization` header:
```http
Authorization: Bearer <jwt_token>
```
RBAC claims are verified on the backend:
- `doctor`: Full read/write access to consultations, diagnoses, and medical records.
- `nurse`: Read-only access to triage queue and patient medical summary; restricted from recording diagnoses or consultations.
- `admin`: Administrative lookup; restricted from clinical modifications.
- `patient`: Forbidden (403) from accessing another patient's medical files or the doctor clinical workstation.

---

### Standard Response Envelopes

#### Success Envelope (HTTP 200, 201)
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... },
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### Error Envelope (HTTP 400, 401, 403, 404, 409, 500)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid input data. Please verify all required clinical fields.",
    "details": [
      {
        "field": "clinicalObservations",
        "message": "Clinical observations or findings are required"
      }
    ]
  }
}
```

---

### Endpoint Catalog

#### 1. Clinical Dashboard & Queue
- **`GET /api/clinical/dashboard/stats`**
  - **Access:** Doctor, Nurse, Admin
  - **Response:**
    ```json
    {
      "success": true,
      "data": {
        "todayAppointments": 8,
        "upcomingAppointments": 14,
        "awaitingConsultation": 3,
        "completedToday": 5,
        "totalConsultations": 142
      }
    }
    ```

- **`GET /api/clinical/dashboard/queue?status=checked-in&date=YYYY-MM-DD`**
  - **Access:** Doctor, Nurse
  - **Response:** Enriched triage appointment list with patient demographics and consultation links.

- **`GET /api/clinical/patients/search?query=Alex&page=1&limit=20`**
  - **Access:** Doctor, Nurse, Admin
  - **Parameters:**
    - `query`: Matches `patientId`, `universityId` (Student/Staff ID), `firstName`, `lastName`, or `email`.
  - **Response:** Array of matched patients with previous visit count and last recorded primary diagnosis.

---

#### 2. Consultations (`/api/consultations`)
- **`POST /api/consultations`**
  - **Access:** Doctor
  - **Request Body:**
    ```json
    {
      "patientId": "664c3e1b1a90c40134567811",
      "appointmentId": "664c3f2e1a90c40134567901",
      "consultationDate": "2026-11-16T08:30:00Z",
      "vitalSigns": {
        "bloodPressure": "120/80",
        "heartRate": 78,
        "temperature": 38.2,
        "oxygenSaturation": 98,
        "respiratoryRate": 16,
        "weight": 70,
        "height": 175
      },
      "presentingComplaints": [
        { "complaint": "Severe sore throat", "duration": "3 days", "severity": "severe" }
      ],
      "symptoms": ["Fever", "Dysphagia", "Malaise"],
      "clinicalObservations": "Bilateral tonsillar hypertrophy with exudates; anterior cervical adenopathy.",
      "diagnoses": [
        {
          "diagnosisName": "Acute Streptococcal Pharyngitis",
          "diagnosisCode": "J02.0",
          "diagnosisType": "primary",
          "severity": "moderate",
          "notes": "Rapid antigen test positive."
        }
      ],
      "doctorNotes": "Patient instructed to isolate for 24h following initiation of antibiotics.",
      "followUpRecommendations": {
        "followUpRequired": true,
        "followUpDate": "2026-11-23",
        "instructions": "Return to clinic if fever persists beyond 48 hours."
      }
    }
    ```
  - **Response:** Status 201 Created with full consultation document and automatically computed BMI.

- **`GET /api/consultations/:id`**
  - **Access:** Doctor, Nurse, Admin
  - **Response:** Status 200 with populated patient, doctor, appointment, and audit trail data.

- **`GET /api/consultations/patient/:patientId?page=1&limit=20&sort=desc`**
  - **Access:** Doctor, Nurse, Admin
  - **Response:** Chronological consultation history for the given patient.

- **`PUT /api/consultations/:id`**
  - **Access:** Doctor
  - **Request Body:**
    ```json
    {
      "clinicalObservations": "Revised findings after radiology review...",
      "reasonForChange": "Updated clinical observation based on chest X-ray findings."
    }
    ```
  - **Response:** Status 200 with updated status `'amended'` and new entry in `auditTrail`.

- **`PATCH /api/consultations/:id/diagnoses`**
  - **Access:** Doctor
  - **Request Body:**
    ```json
    {
      "diagnosisName": "Type 2 Diabetes Mellitus",
      "diagnosisCode": "E11.9",
      "diagnosisType": "secondary",
      "severity": "moderate",
      "clinicalStatus": "active",
      "notes": "Fasting blood sugar 142 mg/dL"
    }
    ```
  - **Response:** Status 200 with appended diagnosis without overwriting existing diagnoses.

---

#### 3. Medical Records (`/api/medical-records`)
- **`GET /api/medical-records/patient/:patientId`**
  - **Access:** Doctor, Nurse, Admin
  - **Response:** Consolidated longitudinal health profile (known allergies, chronic conditions, past surgeries, immunizations, and previous prescription history).

- **`PUT /api/medical-records/patient/:patientId/summary`**
  - **Access:** Doctor, Nurse
  - **Response:** Updates baseline clinical summary indicators.

---

#### 4. Prescription Handoff (`/api/clinical/prescription-handoff`)
- **`POST /api/clinical/prescription-handoff`**
  - **Access:** Doctor
  - **Request Body:**
    ```json
    {
      "consultationId": "664c3f2e1a90c40134567890",
      "handoffNotes": "Prescribe Amoxicillin 500mg TDS for 7 days."
    }
    ```
  - **Response:** Status 200 with verified handoff payload, patient allergies, and deep link for the Prescription Management module.

