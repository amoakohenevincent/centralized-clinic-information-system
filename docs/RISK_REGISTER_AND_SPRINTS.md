# CCIS Risk Register & Agile Sprint Plans
## Risk Management Framework & 8-Week Sprint Execution

> **Course:** Academic Group Project • Level 300 / Week 8 Final Submission  
> **System:** Centralized Clinic Information System (CCIS)  
> **Methodology:** Agile / Scrum with 3-Week Role Rotations

---

## 1. Project Risk Register

The risk register monitors project hazards across technical, clinical governance, schedule, and team dimensions. Risks are evaluated on a 5×5 Probability (P) and Impact (I) scale, yielding a composite Risk Score: `Score = P × I`.

| Risk ID | Category | Risk Description | P (1–5) | I (1–5) | Score | Mitigation Strategy | Owner | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :---: |
| **RSK-01** | Technical | Database connection failure during peak clinic hours | 2 | 5 | 10 | Implemented MongoDB connection pooling, automatic reconnect retries, and in-memory test fallback. | Lead Dev | **Mitigated** |
| **RSK-02** | Security | Unauthorized modification of doctor consultation records | 2 | 5 | 10 | Implemented non-destructive clinical amendments with immutable audit logs and JWT role guards. | Lead Dev | **Mitigated** |
| **RSK-03** | Governance | Duplicate patient registration across campus departments | 3 | 4 | 12 | Pre-registration search filters on patient number, name, and phone before walk-in onboarding. | PM | **Mitigated** |
| **RSK-04** | Schedule | Unequal commit contributions across team members | 2 | 4 | 8 | Enforced feature branch workflow (`feature/*`) requiring pull requests and commits from all 4 members. | PM | **Resolved** |
| **RSK-05** | UI/UX | Visual fatigue and layout breakage on mobile devices | 2 | 3 | 6 | Standardized strict 3-color palette (Teal, Slate, White), removed all icons/emojis, added table scroll wrappers. | Docs Lead | **Resolved** |
| **RSK-06** | Integration | Third-party SMS gateway outage or rate limiting | 3 | 3 | 9 | Built pluggable SMS driver architecture with automatic sandbox fallback and local dispatch logging. | Lead Dev | **Mitigated** |

---

## 2. 8-Week Agile Sprint Plans

### Sprint 1: Foundation & Patient Intake (Weeks 1–3)
- **Sprint Goal:** Establish project scaffold, MongoDB schemas, and front-desk walk-in registration.
- **Role Assignments:**
  - **Project Manager:** Vincent Amoakohene (Sprint planning, Git branching strategy, team coordination)
  - **Lead Developer:** Kuugbepuo Ametus (Node.js/Express scaffold, Mongoose models for Patient and Appointment)
  - **Tester:** 5240101431-SL (Jest setup, unit tests for patient creation)
  - **Documentation Lead:** Vince2456 (API documentation v1.0, Swagger/Postman collection)
- **User Stories Delivered:**
  - *US-01:* As a receptionist, I want to search registered patients so that I do not create duplicate profiles.
  - *US-02:* As a receptionist, I want to onboard walk-in patients with contact details.
  - *US-03:* As a front desk officer, I want to view today's schedule and check in patients.
- **Sprint Review & Velocity:** 18 Story Points completed.

---

### Sprint 2: Clinical Records Core & Electronic Prescriptions (Weeks 4–6)
- **Sprint Goal:** Build the Doctor Clinical Suite, vitals recording with BMI calculation, ICD-10 diagnoses, and pharmacy dispensing lifecycle.
- **Role Assignments:**
  - **Project Manager:** Kuugbepuo Ametus (Tracking clinical requirements, cross-module integration)
  - **Lead Developer:** Vincent Amoakohene (Consultation endpoints, audit logger, electronic prescription handoff)
  - **Tester:** Vince2456 (RBAC security test suite, Supertest assertions)
  - **Documentation Lead:** 5240101431-SL (UML diagrams, IEEE 830 SRS draft)
- **User Stories Delivered:**
  - *US-04:* As a doctor, I want to record vital signs and have BMI calculated automatically.
  - *US-05:* As a doctor, I want to record primary and secondary diagnoses non-destructively.
  - *US-06:* As a doctor, I want to transmit an electronic prescription directly to the pharmacy.
  - *US-07:* As a pharmacist, I want to track dispensing stages across pending, partially dispensed, and fulfilled.
- **Sprint Review & Velocity:** 24 Story Points completed.

---

### Sprint 3: Integration, External SMS, UI Polish & Final Submission (Weeks 7–8)
- **Sprint Goal:** Refactor UI/UX with strict 3-color palette and zero icons, integrate external SMS gateway, run automated regression tests, and prepare final deliverables.
- **Role Assignments:**
  - **Project Manager:** 5240101431-SL (Week 8 deliverable audit, risk verification, final signoff)
  - **Lead Developer:** Vince2456 (External SMS gateway integration, UI/UX 3-color refactoring)
  - **Tester:** Vincent Amoakohene (Automated regression suite, production build verification)
  - **Documentation Lead:** Kuugbepuo Ametus (Word/PDF packaging, 10-minute demo script, reflection guides)
- **User Stories Delivered:**
  - *US-08:* As a patient, I want to receive an SMS notification when my appointment is confirmed and when medications are ready.
  - *US-09:* As a clinical user, I want a clean, responsive UI with zero distracting icons and high readability.
  - *US-10:* As an evaluator, I want a complete Word and PDF specification with verified UML diagrams.
- **Sprint Review & Velocity:** 20 Story Points completed (Total project: 62 Story Points).

