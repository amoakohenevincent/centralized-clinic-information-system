# CCIS Prescription Management — API Documentation

Base URL: `/api/prescriptions`  
All endpoints require a valid CCIS JWT token in the `Authorization: Bearer <token>` header.

---

### 1. Dashboard Metrics
- **Method:** `GET`
- **Route:** `/api/prescriptions/dashboard-stats`
- **Access:** Doctor, Pharmacist, Nurse, Admin
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 42,
    "pending": 8,
    "partiallyDispensed": 4,
    "fulfilled": 28,
    "pendingBackorder": 2,
    "createdToday": 14,
    "recentPrescriptions": [ /* 5 latest prescriptions */ ]
  }
}
```

---

### 2. List Prescriptions
- **Method:** `GET`
- **Route:** `/api/prescriptions`
- **Access:** Doctor, Pharmacist, Nurse, Admin
- **Query Parameters:**
  - `status`: Filter by `pending`, `partially_dispensed`, `fulfilled`, `pending_backorder`, `cancelled`
  - `patientId`: Filter by MongoDB Patient ID
  - `search`: Case-insensitive text search (RX#, patient name, or student/staff ID)
  - `startDate`, `endDate`: Date range filter
  - `page` (default: 1), `limit` (default: 10)
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 10,
  "total": 42,
  "totalPages": 5,
  "currentPage": 1,
  "data": [ /* Array of Prescription Documents */ ]
}
```

---

### 3. Create Prescription
- **Method:** `POST`
- **Route:** `/api/prescriptions`
- **Access:** Doctor only
- **Request Body:**
```json
{
  "patientId": "654c1a2f1b4e2d001a23bc01",
  "patientName": "Kofi Mensah",
  "patientIdentifier": "STU-2024-8841",
  "consultationId": "654c1b5e1b4e2d001a23bc99",
  "clinicalDiagnosis": "Acute Bacterial Tonsillitis",
  "generalInstructions": "Take medications after meals with water",
  "isControlledMedication": false,
  "items": [
    {
      "medicineId": "654c09ef1b4e2d001a23ba10",
      "medicineName": "Amoxicillin Trihydrate",
      "strength": "500mg",
      "form": "Capsule",
      "dosage": "1 capsule",
      "frequency": "Three times daily (TDS)",
      "duration": "7 days",
      "quantityPrescribed": 21,
      "instructions": "Take after meals every 8 hours"
    }
  ]
}
```
- **Response (201 Created):** Returns created prescription with unique `prescriptionNumber` (e.g., `RX-202611-0001`) and `status: 'pending'`.

---

### 4. Update Prescription (Pre-Dispense Only)
- **Method:** `PUT`
- **Route:** `/api/prescriptions/:id`
- **Access:** Doctor only
- **Constraint:** Allowed **only** when `status === 'pending'`. Returns `409 Conflict` if status is `partially_dispensed` or `fulfilled`.
- **Request Body:**
```json
{
  "reason": "Adjusted duration following laboratory culture report",
  "generalInstructions": "Drink plenty of warm water",
  "items": [ /* Optional updated items array */ ]
}
```

---

### 5. Pharmacy Dispensing Handoff
- **Method:** `PATCH`
- **Route:** `/api/prescriptions/:id/dispense-status`
- **Access:** Pharmacist only (Madam Sarah)
- **Request Body:**
```json
{
  "status": "partially_dispensed",
  "dispensingNotes": "Item 1 dispensed. Item 2 currently out of stock.",
  "itemsDispensed": [
    {
      "medicineId": "654c09ef1b4e2d001a23ba10",
      "quantityDispensed": 21,
      "batchNumber": "BAT-2026-99"
    },
    {
      "medicineId": "654c09ef1b4e2d001a23ba25",
      "quantityDispensed": 0,
      "itemStatus": "backordered"
    }
  ]
}
```
- **Integrity Rule:** If `status: 'fulfilled'` is requested but any item has `quantityDispensed < quantityPrescribed`, the server rejects with `422 Unprocessable Entity`.
