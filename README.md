# Healthagram — Clinical Management System (Phase 1 & Phase 2)

Healthagram is an event-based clinical management system designed around the core principle:

> **ONE PATIENT → ONE SHARED CLINICAL RECORD → MULTIPLE AUTHORIZED DOCTORS**

Junior doctors, senior doctors, and specialists collaborate on the **exact same** underlying patient record. History is never silently overwritten, and the complete clinical timeline is maintained chronologically with full lineage, regulatory auditability, and role-differentiated perspectives.

---

## Core UI Architecture: Same Patient Data + Different Responsibilities

All three medical roles use the **same underlying clinical record**. The dashboards and views are structured around each role's distinct clinical responsibility:

| Role | Primary Guiding Question | Dashboard Focus | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Junior Doctor** *(Dr. Ananya / Dr. Praveen)* | *"What do I need to do?"* | • My Patients<br>• My Tasks<br>• Clinical Updates<br>• Senior Approach browse | Record vitals/observations, administer prescribed doses, request senior review/specialist consult, handovers. |
| **Senior Doctor** *(Dr. Suresh / Dr. Divya)* | *"What needs my decision?"* | • Patients Needing Review<br>• Junior Escalations<br>• Unreviewed Lab Results<br>• Specialist Updates | Formulate diagnoses, prescribe/modify/discontinue drugs, review test results, issue senior instructions, share **Senior Approach** cases. |
| **Specialist Consultant** *(Dr. Swetha / Dr. Anand)* | *"Which cases need my expertise?"* | • New Referrals & Consults<br>• Active Inpatient Consults<br>• Diagnostic Results<br>• Completed Recommendations | Review referrals & imaging/lab reports, file specialist assessments & recommendations, request specific investigations. |

---

## Key Phase 2 Features Implemented

### 1. Shared Patient Page (Section 7)
All roles access the unified patient record structured in clinical order of importance:
1. **Patient Header**: MRN, age, gender, contact, allergy alerts, active admission status.
2. **Current Status**: Admission reason, background medical history, active care team.
3. **What Changed**: High-visibility change detection card highlighting new results, medication alterations, senior instructions, and specialist notes since the user's previous viewing.
4. **Current Treatment**: Active medication regimen with full historical lineage for discontinued/changed drugs.
5. **Investigations**: Lab and imaging orders with real-time result reporting and doctor impressions.
6. **Senior Instructions & Specialist Consults**: Multi-doctor directions and consultative responses.
7. **Clinical Timeline**: Chronological, immutable audit trail of bedside assessments and notes.
8. **Clinical Communication & Care Team**: Shift handovers, multidisciplinary team assignments.

### 2. "What Changed" Feature (Section 3 & 7)
- Backed by the `PatientViewAudit` model tracking `[userId, patientId, viewedAt]`.
- Endpoints: `GET /api/patients/:id/what-changed` and `POST /api/patients/:id/mark-viewed`.
- Displays delta of clinical events, prescriptions, investigation results, specialist consults, and handover communications since the doctor's last visit.

### 3. Senior Approach Feature (Section 8–12)
- **Not an e-learning course or training module.** Senior Approach is an additional clinical knowledge layer capturing:
  - Clinical Situation
  - Senior Assessment
  - Senior Decision
  - Treatment / Prescribing Approach
  - Clinical Reasoning
  - Outcome / Follow-up
- Linked directly via foreign keys (`patientId`, `encounterId`, `seniorDoctorId`) to the real patient record.
- **Two-way navigation**: Doctors browsing Senior Approach can click **"Open Original Clinical Record"** to immediately navigate into that patient's live shared file.
- Senior Doctors can author and share a Senior Approach directly from any real patient page.

---

## Consistent Sample Data (South Indian Practitioners & Patients)

The entire application UI, medical records, diagnoses, and notes are strictly in **English**. All demo practitioners and patients use realistic **South Indian names** consistently across every view:

### Practitioners:
- **Dr. Suresh Venkatraman** (`SENIOR_DOCTOR` — Internal Medicine Attending): `suresh@healthagram.clinic`
- **Dr. Divya Subramanian** (`SENIOR_DOCTOR` — Senior Consultant): `divya@healthagram.clinic`
- **Dr. Ananya Sundaram** (`JUNIOR_DOCTOR` — Resident PGY-2): `ananya@healthagram.clinic`
- **Dr. Praveen Kumar** (`JUNIOR_DOCTOR` — House Officer): `praveen@healthagram.clinic`
- **Dr. Swetha Balasubramanian** (`SPECIALIST` — Cardiology & Electrophysiology): `swetha@healthagram.clinic`
- **Dr. Anand Natarajan** (`SPECIALIST` — Neurology & Stroke Medicine): `anand@healthagram.clinic`
*(Password for all demo accounts: `Password123!`)*

### Inpatients:
- **Meenakshi** (`PAT-1001`, Age 68, Female) — Paroxysmal AFib with RVR, penicillin allergy, airway reactivity.
- **Raghav Kumar** (`PAT-1002`, Age 52, Male) — Hypertension, fatigue, inpatient telemetry.
- **Arjun Raj** (`PAT-1003`, Age 42, Male) — Refractory Migraine with Neurology consult.
- **Karthik** (`PAT-1004`, Age 75, Male) — COPD exacerbation with baseline Stage 3 CKD.
- **Saranya** (`PAT-1005`, Age 29, Female) — Palpitations and endocrine observation.

---

## Role-Based Security & Permissions Verification

Healthagram implements strict backend authorization that cannot be bypassed via frontend state:
- **Prescribing Medication**: Restricted to `SENIOR_DOCTOR` and `SPECIALIST` (`authorizeRole('SENIOR_DOCTOR', 'SPECIALIST')`). Junior doctors attempting to prescribe receive a `403 Forbidden`.
- **Modifying / Discontinuing Medications**: Restricted to `SENIOR_DOCTOR` and `SPECIALIST`.
- **Specialist Record Scoping**: Specialists can only access patient records referred or assigned to them (`403 Forbidden` if attempting to view an unreferred patient).
- **Authoring Senior Approach**: Exclusively restricted to `SENIOR_DOCTOR` (`authorizeRole('SENIOR_DOCTOR')`).

---

## Quick Start & Verification

### Start the Servers

1. **Backend Server** (Port 5000):
   ```bash
   npm run dev:server
   ```
2. **Frontend Client** (Port 5173):
   ```bash
   npm run dev:client
   ```

### Run End-to-End Clinical Workflow & Security Test

```bash
cd server
npx tsx scripts/test-workflow.ts
```
*(Executes all 22 automated test steps verifying multi-role doctor workflows, prescription modifications, specialist consults, "What Changed" queries, Senior Approach sharing, Junior prescribing restriction [403], Junior Senior Approach publication restriction [403], Specialist unreferred patient access restriction [403], and audit trail verification).*
