# Centralized Clinic Information System (CCIS) — Prescription Management Module

**Module Number:** Module 3  
**Technology Stack:** React.js, Tailwind CSS, Node.js, Express.js, MongoDB, Mongoose, JWT & bcrypt, REST APIs, Jest & Supertest, Postman  
**Component Author:** Prescription Management Module Lead & Senior Architect  
**Integration Stakeholders:**
- Module 1: Patient and Appointment Management
- Module 2: Clinical Records Management
- Module 4: Pharmacy and Inventory Management (Madam Sarah)

---

## 1. Component Overview
The **Prescription Management Module** bridges the gap between patient consultations and pharmaceutical dispensing in the University Clinic Information System. It empowers authorized physicians to compose, validate, digitally authorize, and dispatch prescriptions to the clinic pharmacy, while tracking medication dispensing fulfillment across the agreed lifecycle: `Pending`, `Partially dispensed`, `Fulfilled`, and `Pending backorder`.

---

## 2. Directory & Repository Structure

```
ccis-prescription-management/
├── backend/
│   ├── config/
│   │   └── db.js                        # Resilient MongoDB connection
│   ├── controllers/
│   │   └── prescriptionController.js    # Core clinical business logic & guards
│   ├── middleware/
│   │   ├── auth.js                      # Shared JWT authentication middleware
│   │   ├── roleCheck.js                 # Role-based guards (Doctor, Pharmacist)
│   │   └── validateRequest.js           # Express-validator clinical validation rules
│   ├── models/
│   │   ├── Prescription.js              # Mongoose Prescription schema & indexes
│   │   └── Medicine.js                  # Shared catalogue interface (Module 4)
│   ├── routes/
│   │   └── prescriptionRoutes.js        # REST API route declarations
│   ├── utils/
│   │   ├── prescriptionIdGenerator.js   # Sequential RX number generator (RX-YYYYMM-XXXX)
│   │   └── auditLogger.js               # Clinical modification audit helper
│   ├── tests/
│   │   └── prescription.test.js         # Comprehensive Jest & Supertest automated suite
│   ├── .env.example                     # Environment template
│   ├── package.json                     # Backend dependencies & test scripts
│   └── server.js                        # Express app entry point
├── frontend/
│   ├── public/
│   │   └── index.html                   # HTML entry point
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Badge.jsx            # Standardized status badges
│   │   │   │   ├── Button.jsx           # Accessible button states & loading spinners
│   │   │   │   ├── Modal.jsx            # Accessible dialog overlay
│   │   │   │   ├── StatCard.jsx         # KPI dashboard metric card
│   │   │   │   ├── Alert.jsx            # Clinical allergy & error banners
│   │   │   │   └── Navbar.jsx           # Top navigation & simulation role switcher
│   │   │   └── prescription/
│   │   │       ├── MedicineSelectorModal.jsx # Searchable catalogue picker with stock badges
│   │   │       ├── PrescriptionItemRow.jsx   # Multi-field item builder row
│   │   │       ├── DispensingTracker.jsx     # Visual fulfillment progress & checklist
│   │   │       └── HandoffConfirmation.jsx   # Clinical sign-off & safety checklist
│   │   ├── pages/
│   │   │   ├── PrescriptionDashboard.jsx     # View 1: Clinical dashboard & metrics
│   │   │   ├── CreatePrescription.jsx        # View 2: Multi-item prescription authoring
│   │   │   ├── MedicineSelectionView.jsx     # View 3: Shared medicine catalogue browser
│   │   │   ├── PrescriptionDetails.jsx       # View 4: Official printable RX record & audit
│   │   │   ├── PrescriptionHistory.jsx       # View 5: Multi-filter historical archive
│   │   │   ├── PrescriptionStatusTracker.jsx # View 6: Live status & dispensing action panel
│   │   │   └── PrescriptionHandoff.jsx       # View 7: Electronic handoff receipt & summary
│   │   ├── services/
│   │   │   └── prescriptionService.js        # API service layer with resilient local cache
│   │   ├── context/
│   │   │   └── AuthContext.jsx               # Role & JWT auth context
│   │   ├── App.jsx                           # Application shell & tab navigation
│   │   ├── index.css                         # Tailwind CSS styling directives
│   │   └── main.jsx                          # React 18 DOM mount
│   ├── tailwind.config.js                    # Healthcare color palette configuration
│   ├── postcss.config.js
│   ├── package.json                          # Frontend dependencies
│   └── vite.config.js                        # Vite proxy & build configuration
├── postman/
│   └── CCIS_Prescription_Management.postman_collection.json # Ready-to-import Postman suite
├── docs/
│   ├── ARCHITECTURE.md                       # Architectural diagrams & boundary specifications
│   ├── API_DOCUMENTATION.md                  # Comprehensive REST endpoint documentation
│   └── INTEGRATION_GUIDE.md                  # Interface guide for Sarah & Clinical Records leads
└── README.md                                 # Main project documentation
```

---

## 3. Installation & Setup Instructions

### 3.1 Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Start the development server on port 5000
npm run dev
```

### 3.2 Frontend Setup
```bash
cd frontend
npm install
# Start the Vite development server on port 3000
npm run dev
```

---

## 4. Environment Variables (`backend/.env`)

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/ccis_db
JWT_SECRET=ccis_shared_jwt_super_secret_key_development_only
CLIENT_ORIGIN=http://localhost:3000
```

---

## 5. Automated Testing (Jest & Supertest)

Run the comprehensive automated test suite covering creation, RBAC, input validation, state transitions, and dispensing rules:

```bash
cd backend
npm test
```

### Verified Test Matrix:
- **TEST-01:** Authorized doctor creates valid multi-item prescription (`201 Created`).
- **TEST-02:** Rejection of prescription missing required fields (`400 Bad Request`).
- **TEST-03:** Rejection of prescription with empty items list (`400 Bad Request`).
- **TEST-04:** Rejection of inactive/non-existent medicine ID (`400 Bad Request`).
- **TEST-05:** Security guard: Nurse/Pharmacist denied creation access (`403 Forbidden`).
- **TEST-06:** Security guard: Missing/invalid JWT token rejected (`401 Unauthorized`).
- **TEST-07:** Paginated retrieval with status filter (`200 OK`).
- **TEST-08:** Dashboard aggregate metrics calculation (`200 OK`).
- **TEST-09:** Patient prescription history retrieval (`200 OK`).
- **TEST-10:** Controlled doctor update while `status === 'pending'` with audit log (`200 OK`).
- **TEST-11:** Pharmacy handoff: Pharmacist records partial dispensing (`200 OK`).
- **TEST-12:** State Guard: Doctor edit locked once dispensing commences (`409 Conflict`).
- **TEST-13:** Integrity Guard: Reject marking prescription `fulfilled` when items remain uncompleted (`422 Unprocessable Entity`).

---

## 6. Integration Contract Summary

1. **Inbound from Clinical Records (Module 2):**
   - Injects `patientId`, `consultationId`, `doctorId`, and `clinicalDiagnosis`.
2. **Read-Only from Pharmacy Catalogue (Madam Sarah - Module 4):**
   - References `Medicine` collection directly to verify item code, form, strength, and live stock levels.
3. **Outbound to Pharmacy Queue:**
   - Saved with unique human-readable `prescriptionNumber` (`RX-YYYYMM-XXXX`) under `pending` status.
4. **Dispensing Updates from Pharmacy:**
   - Received via `PATCH /api/prescriptions/:id/dispense-status`.
   - Never marked `fulfilled` until every single item is completely dispensed!
