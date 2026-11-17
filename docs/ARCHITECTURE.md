# CCIS Prescription Management Module — System Architecture

## 1. Overview
The **Prescription Management Module** is Module 3 of the Centralized Clinic Information System (CCIS). It provides authorized physicians with a secure, validated interface to prescribe medications after consultations and coordinates electronically with the Pharmacy and Inventory Management component (Module 4) for dispensing.

## 2. Core Architectural Principles
- **No Duplicate Database:** Connects to the single centralized CCIS MongoDB instance (`ccis_db`).
- **No Duplicate Medicine Catalogue:** References the shared `Medicine` catalogue maintained by Madam Sarah's Pharmacy module (`medicines` collection).
- **Snapshot Immutability:** Preserves clinical snapshots of medicine name, strength, and form within each prescription item at the moment of authoring.
- **Strict Dispensing State Machine:**
  - Statuses: `pending`, `partially_dispensed`, `fulfilled`, `pending_backorder`, `cancelled`.
  - Guard: A prescription is **never** marked `fulfilled` unless every prescribed item has `quantityDispensed >= quantityPrescribed`.
  - Lockout: Once pharmacy dispensing has commenced (`partially_dispensed`, `fulfilled`, `pending_backorder`), doctor edits are locked to prevent clinical/inventory desynchronization.
  - Audit Trail: Any changes prior to dispensing are logged with timestamps, modifying user, reason, and prior values.

## 3. Component Boundary & Interaction
```
+------------------------------------+        +------------------------------------+
|  Module 1: Patient & Appointment   |        |  Module 2: Clinical Records        |
|  - Patient Demographics & Allergies|        |  - Consultation ID & Diagnosis     |
+-----------------+------------------+        +-----------------+------------------+
                  |                                             |
                  +---------------------+-----------------------+
                                        |
                                        v
                    +---------------------------------------+
                    | MODULE 3: PRESCRIPTION MANAGEMENT     |
                    | (Our Component)                       |
                    | - Prescription Builder & Validation   |
                    | - Clinical State Transition Guards    |
                    | - Pre-dispense Audit Logger           |
                    | - Pharmacy Electronic Handoff Dispatch|
                    +-------------------+-------------------+
                                        |
                                        v (Shared Database & REST Handoff)
                    +---------------------------------------+
                    | Module 4: Pharmacy & Inventory (Sarah)|
                    | - Shared Medicine Catalogue (Stock)   |
                    | - Dispensing Queue & Status Updates   |
                    +---------------------------------------+
```
