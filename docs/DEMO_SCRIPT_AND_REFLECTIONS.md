# CCIS 10-Minute Demo Script & Individual Reflection Guide

> **Course:** Academic Group Project • Week 8 Final Submission  
> **System:** Centralized Clinic Information System (CCIS)  
> **Components:** 10-Minute Presentation Walkthrough & Individual Reflection Framework

---

## Part 1: 10-Minute Live Demo & Presentation Script

This script provides a minute-by-minute timeline for the team to present the project to academic evaluators within the 10-minute time constraint.

### Presentation Agenda (10:00 Total)

```
[0:00 - 1:30]   Introduction, Campus Problem & Scope (Presenter: Project Manager)
[1:30 - 3:00]   Architecture, Tech Stack & Database Schema (Presenter: Lead Developer)
[3:00 - 7:00]   Live End-to-End System Demonstration (All Members Live Roleplay)
                • 3:00 - 4:00: Patient Portal Booking & Reception Check-in
                • 4:00 - 5:30: Doctor Consultation (SOAP, Vitals, BMI, ICD-10 & Audit)
                • 5:30 - 7:00: Electronic Prescription Handoff & Pharmacy Dispensing
[7:00 - 8:30]   Testing, Security & Quality Assurance (Presenter: Testing Engineer)
[8:30 - 9:30]   Agile Sprints, Role Rotations & Risk Management (Presenter: Docs Lead)
[9:30 - 10:00]  Conclusion, Lessons Learned & Q&A Transition
```

---

### Minute-by-Minute Speaking Points

#### 1. Introduction & Problem Statement [0:00 – 1:30]
- **Speaker:** Project Manager
- **Talking Points:**
  - *"Good morning/afternoon, panel. Today our team presents the Centralized Clinic Information System (CCIS), engineered to solve the university clinic's chronic waiting room congestion and paper record misplacement."*
  - *"In accordance with the project brief, CCIS implements 4 core modules, persistent MongoDB storage, an external SMS notification service, and strict role-based access control."*
  - *"Our UI uses an executive 3-color design system (Teal, Slate, White) with zero emojis or icons for clinical clarity and full responsiveness across devices."*

#### 2. Architecture & Database Design [1:30 – 3:00]
- **Speaker:** Lead Developer
- **Talking Points:**
  - *"We adopted a Three-Tier Layered Architecture: a responsive React 18 SPA frontend, an Express.js REST API with JWT authorization, and MongoDB with Mongoose ODM."*
  - *"Display Figure 1 (Architecture) and Figure 6 (ERD) from our SRS document."*
  - *"Notice our referential integrity: Patients link to Appointments, Appointments to Consultations, and Consultations to Prescriptions, while Audit Logs maintain an immutable history of clinical edits."*

#### 3. Live System Demonstration [3:00 – 7:00]
- **Scene A (Reception Desk):** Open `http://localhost:5173/reception/walk-in`. Demonstrate searching for existing patients by campus ID. Switch to `/reception/schedule` and click *"Check-in Patient"*. Show appointment status change to `checked_in`.
- **Scene B (Doctor Clinical Suite):** Open `http://localhost:5173/doctor/dashboard`. Show the patient appearing in the live queue. Click *"Start Consultation"*. Enter blood pressure, heart rate, height, and weight—point out the **automatic BMI calculation**. Add complaints and an ICD-10 diagnosis. Click *"Submit Consultation"*.
- **Scene C (Audit Amendment):** Open the consultation detail. Click *"Amend Record"*, modify notes, provide a clinical justification, and save. Show the immutable audit timeline rendering the delta diff with timestamps.
- **Scene D (Prescription & Dispensing):** Transition to `/prescriptions/create`. Author medications. Complete the handoff to `/prescriptions`. Switch to the Pharmacy queue, open the 3-state dispensing tracker, and mark items fulfilled. Point out the external SMS notification dispatch.

#### 4. Testing & Software Quality Assurance [7:00 – 8:30]
- **Speaker:** Testing Engineer
- **Talking Points:**
  - *"We designed an automated test suite using Jest and Supertest in `backend/tests/`."*
  - *"Our automated tests verify RBAC boundaries (unauthorized users cannot access clinician routes) and enforce schema constraints."*
  - *"Our frontend production build transforms 144 modules in 2m 2s with 0 errors, and automated scans verified 0 icons, 0 emojis, and strict 3-color compliance."*

#### 5. Agile Governance & Reflection [8:30 – 10:00]
- **Speaker:** Documentation Lead
- **Talking Points:**
  - *"We successfully rotated the four mandated roles (PM, Lead Dev, Tester, Docs Lead) across three sprints."*
  - *"Every team member has contributed code and commits to our shared GitHub repository."*
  - *"We invite questions from the panel."*

---

## Part 2: Individual One-Page Reflection Framework

Every student in the group must submit a **one-page individual reflection** linking their project contribution to at least **two course units**. Below is the structured template with unit mapping guidance:

### Recommended Syllabus Unit Mappings

| Syllabus Unit | Key Academic Concepts to Link in Your Reflection |
| :--- | :--- |
| **Unit A: Requirements Engineering** | Translating clinic operational bottlenecks into IEEE 830 functional/non-functional requirements; user personas (doctor, nurse, student); use case modeling. |
| **Unit B: Software Architecture & Design** | Three-tier architecture; decoupling client and server; RESTful API design; state machine transitions for appointments and prescriptions. |
| **Unit C: Agile & Scrum Methodology** | 3-week role rotations; sprint backlog management; velocity tracking; handling scope adjustments under tight academic deadlines. |
| **Unit D: Software Quality Assurance & Testing** | Test-driven development; automated regression testing with Jest; Supertest integration; boundary value analysis on vital signs (BMI ranges). |
| **Unit E: Database Systems & Data Modeling** | Relational vs. NoSQL tradeoffs; embedding vs. referencing in Mongoose; indexing unique identifiers (`patientNumber`, `prescriptionNumber`). |
| **Unit F: Ethics, Data Privacy & Security** | Confidentiality of patient clinical data; RBAC authorization; immutable audit logs to prevent clinical tampering without justification. |

---

### Student Reflection Submission Template

```markdown
# Individual Project Reflection

**Student Name:** [Insert Full Name]  
**Student ID:** [Insert Student ID Number]  
**Team Role(s) Held:** [e.g. Lead Developer in Sprint 1, Project Manager in Sprint 2, Tester in Sprint 3]  
**Project System:** Centralized Clinic Information System (CCIS)  

---

### 1. Overview of Individual Contributions
[Describe the specific modules, pages, API endpoints, tests, or documentation you directly owned and committed to the GitHub repository. Mention specific files and git commit history.]

### 2. Connection to Unit 1: [e.g. Software Architecture & Design]
[Explain how you applied concepts from this unit to your work. For example: How implementing the Three-Tier Architecture allowed the frontend React SPA to communicate cleanly with the Express REST API via JSON Web Tokens, or how you designed the State Machine for appointment lifecycles.]

### 3. Connection to Unit 2: [e.g. Software Quality Assurance & Testing]
[Explain how you applied concepts from this unit. For example: How writing automated Jest tests and testing RBAC boundaries ensured that receptionists could not tamper with doctor consultation notes, or how automated build pipelines prevented regression bugs.]

### 4. Key Engineering Challenges & Solutions
[Describe one major technical or organizational hurdle you encountered (e.g. integrating the prescription handoff, enforcing the strict 3-color UI system, or coordinating team git branches) and how you solved it.]

### 5. Lessons Learned & Professional Growth
[Reflect on what you learned about working in an agile team with rotating leadership roles and how this experience prepares you for professional software engineering.]
```

