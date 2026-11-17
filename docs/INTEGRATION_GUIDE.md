# CCIS Cross-Module Integration Guide

This guide establishes the coordination protocols between **Module 3 (Prescription Management)** and the three collaborating modules in the CCIS system.

---

## 1. Integration with Module 1: Patient and Appointment Management

### Data Provided by Module 1:
- `patientId`: MongoDB `ObjectId` of the patient record.
- Patient full name, student/staff ID number, age, gender.
- Known active drug allergies.

### Frontend Linkage:
When initiating a prescription from a patient chart or appointment checkout:
```javascript
// URL scheme to pre-populate patient context in Prescription Module
window.location.href = `/prescriptions/new?patientId=${patient._id}&patientName=${encodeURIComponent(patient.name)}&patientIdentifier=${patient.identifier}`;
```

---

## 2. Integration with Module 2: Clinical Records Management

### Data Provided by Module 2:
- `consultationId`: MongoDB `ObjectId` of the clinical encounter.
- `doctorId`: MongoDB `ObjectId` of the attending physician (extracted from JWT).
- Clinical diagnosis string.

### Clinical Workflow:
At the conclusion of a clinical consultation in Module 2, the doctor clicks **"Prescribe Medication"**:
```javascript
window.location.href = `/prescriptions/new?consultationId=${consultation._id}&patientId=${consultation.patientId}&diagnosis=${encodeURIComponent(consultation.diagnosis)}`;
```

---

## 3. Integration with Module 4: Pharmacy and Inventory Management (Madam Sarah)

### Data Provided by Module 4 to Module 3:
- Read-only access to the shared `Medicine` catalogue collection (`medicines`).
- Fields used: `_id`, `name`, `genericName`, `strength`, `form`, `currentStock`, `reorderLevel`, `isControlled`.

### Data Provided by Module 3 to Module 4:
- Newly created prescriptions automatically enter the pharmacy queue with `status: 'pending'`.
- Pharmacist queries active queue via:
```http
GET /api/prescriptions?status=pending
```

### Dispensing Handoff Feedback from Module 4 to Module 3:
When the pharmacist dispenses items, Module 4 calls:
```http
PATCH /api/prescriptions/:id/dispense-status
Authorization: Bearer <pharmacist_jwt>
Content-Type: application/json

{
  "status": "partially_dispensed" | "fulfilled" | "pending_backorder",
  "dispensingNotes": "Dispensing note entered by pharmacist",
  "itemsDispensed": [
    {
      "medicineId": "654c09ef1b4e2d001a23ba10",
      "quantityDispensed": 21,
      "batchNumber": "BAT-2026-09A"
    }
  ]
}
```

### Inviolable Invariant for Module 4:
**Do not send `status: "fulfilled"` unless every single item in the prescription has `quantityDispensed >= quantityPrescribed`.** The backend validates this condition and will return `422 Unprocessable Entity` if violated.
