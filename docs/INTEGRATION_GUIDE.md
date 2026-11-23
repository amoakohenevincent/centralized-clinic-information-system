# CCIS Clinical Records Management — Inter-Module Integration Guide
## Integration Contract for the Central CCIS Engineering Team

This guide establishes the precise technical boundaries, data contracts, and integration interfaces between **Clinical Records Management** and the other three CCIS functional components.

---

### 1. Integration with Module 1: Patient and Appointment Management (Developer 1)

#### Direction of Data
- **Inbound:** Clinical Records receives registered patient profiles and scheduled appointment queues.
- **Outbound:** When a consultation is completed or initiated, Clinical Records updates the appointment status (`in-consultation`, `completed`).

#### Agreed Schema Identifiers
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `patientId` | `ObjectId` (ref: `Patient`) | Primary MongoDB ObjectId linking patient records. |
| `patientIdentifier` | `String` (e.g. `PAT-2026-0042`) | Human-readable patient registration code. |
| `universityId` | `String` (e.g. `STU-2023-8821`, `EMP-2018-0419`) | University Student or Staff ID. |
| `appointmentId` | `ObjectId` (ref: `Appointment`) | Unique appointment reference. |
| `appointmentNumber` | `String` (e.g. `APT-2026-0042`) | Human-readable queue number code. |
| `doctorId` | `ObjectId` (ref: `User`) | Attending physician user ID. |

#### Contract Rules
1. Clinical Records **never** creates a duplicate patient or appointment collection.
2. Clinical Records queries `Patient.find({ $or: [ { patientId }, { universityId }, { firstName }, { lastName } ] })`.
3. Upon finalizing a consultation via `POST /api/consultations`, the appointment status is automatically set to `'completed'`:
   ```javascript
   await Appointment.findByIdAndUpdate(appointmentId, { status: 'completed' });
   ```

---

### 2. Integration with Module 3: Prescription Management (Developer 2)

#### Direction of Data
- **Outbound:** When a doctor completes a consultation, the doctor initiates prescription handoff via `POST /api/clinical/prescription-handoff`.
- **Inbound:** Clinical Records reads past prescription history from the shared `prescriptions` collection to render previous medications in the patient's medical history.

#### Prescription Handoff Payload Specification
When a consultation is completed, the doctor triggers the handoff. The Clinical Records module generates and transmits this verified payload:
```json
{
  "consultationId": "664c3f2e1a90c40134567890",
  "consultationNumber": "CNS-2026-0042",
  "consultationDate": "2026-11-16T08:30:00.000Z",
  "patient": {
    "_id": "664c3e1b1a90c40134567811",
    "patientId": "PAT-2026-0042",
    "universityId": "STU-2023-8821",
    "fullName": "Alex Rivera",
    "dateOfBirth": "2003-05-14T00:00:00.000Z",
    "gender": "male",
    "bloodGroup": "O+"
  },
  "doctor": {
    "_id": "664c3a001a90c40134567801",
    "fullName": "Dr. Sarah Jenkins",
    "specialization": "Internal Medicine",
    "licenseNumber": "MD-88319-UNIV"
  },
  "diagnoses": [
    {
      "diagnosisName": "Acute Streptococcal Pharyngitis",
      "diagnosisCode": "J02.0",
      "diagnosisType": "primary",
      "severity": "moderate"
    }
  ],
  "patientAllergies": [
    {
      "allergen": "Penicillin",
      "category": "drug",
      "reaction": "Anaphylaxis",
      "severity": "life-threatening"
    }
  ],
  "vitalSigns": {
    "bloodPressure": "120/80",
    "heartRate": 78,
    "temperature": 38.2,
    "bmi": 22.9
  },
  "clinicalObservationsSummary": "Bilateral tonsillar hypertrophy with exudates; anterior cervical adenopathy.",
  "handoffNotes": "Prescribe non-penicillin antibiotic (e.g. Azithromycin 500mg) due to documented severe allergy.",
  "redirectUrl": "/prescriptions/new?consultationId=664c3f2e1a90c40134567890&patientId=664c3e1b1a90c40134567811"
}
```

#### Contract Rules
1. Clinical Records **does not** create or alter prescriptions.
2. The Prescription Module reads `consultationId` and `diagnoses` to ensure prescriptions are never issued without a verified doctor consultation.
3. Once the prescription is finalized by Developer 2, the prescription record stores `consultationId`.

---

### 3. Integration with Module 4: Pharmacy and Inventory Management (Developer 3)

#### Direction of Data
- Clinical Records does not directly modify pharmaceutical inventory.
- Clinical Records reads medication dispensing statuses (`dispensed`, `partially_dispensed`) indirectly through the patient's prescription timeline to alert doctors on patient treatment compliance.

---

### 4. Shared Authentication & JWT Contract
All CCIS services share the secret key:
```env
JWT_SECRET=ccis_shared_jwt_secret_university_clinic_2026
```
The token payload contains:
```json
{
  "id": "664c3a001a90c40134567801",
  "username": "dr_sjenkins",
  "role": "doctor",
  "firstName": "Sarah",
  "lastName": "Jenkins",
  "email": "dr.jenkins@clinic.university.edu",
  "exp": 1731772800
}
```
Clinical Records verifies that `req.user.role === 'doctor'` for clinical recording and modification operations.

