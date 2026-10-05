# Healthagram

Healthagram is a clinical management and coordination system that gives authorized doctors a shared patient record while providing role-specific workflows for junior doctors, senior doctors, and specialists.

---

## What Healthagram Does

- **One patient → one shared clinical record**: All authorized doctors access and update the same patient file; records are never duplicated across roles.
- **Shared clinical history**: Junior doctors, senior attendings, and consulting specialists work from the same live clinical information.
- **Chronological timeline**: All clinical events, assessments, vitals, and progress notes are preserved in an immutable, timestamped timeline.
- **Full clinical tracking**: Doctors can review assessments, active and past prescriptions, recorded medication administrations, ordered investigations and diagnostic results, specialist referrals, clinical instructions, and follow-ups.
- **Role-specific dashboards**: Information and action items are prioritized based on the responsibilities of each doctor role.
- **Senior Approach sharing**: Senior doctors can optionally share real, de-identified clinical decision workflows for complex patient cases.
- **Junior clinical learning**: Senior Approach cases are accessible to junior doctors as a dedicated learning and reference view that links directly back to the live patient record.

---

## Doctor Roles

### Junior Doctor
*Focus: What do I need to do?*
- **Assigned Patients**: Track active inpatients admitted under the team.
- **Tasks**: Prioritized task list highlighting scheduled and STAT medication administrations.
- **Clinical Updates**: Real-time feed of recent clinical events, progress notes, and vitals logged across the ward.
- **Patient Record**: Full access to the shared patient file, medical history, and clinical timeline.
- **Senior Instructions**: Review directives, treatment targets, and clinical plans issued by attending physicians.
- **Specialist Recommendations**: View consultative impressions and diagnostic recommendations from specialists.
- **Medication Administration**: Record administered, held, or refused doses against valid senior prescriptions.
- **Senior Approach**: Browse clinical approach case guides to learn attending-level decision-making.

### Senior Doctor
*Focus: What needs my decision?*
- **Patients Needing Review**: Rapid triage of inpatients requiring clinical evaluation or discharge readiness review.
- **Junior Requests**: Review and action junior doctor escalations and clinical questions.
- **New Results**: Immediate visibility of newly reported laboratory panels and diagnostic imaging.
- **Changed Conditions**: Alerts on acute clinical condition modifications or vital status changes.
- **Treatment Decisions**: Authorize, adjust, or discontinue medication regimens with required clinical justification.
- **Specialist Updates**: Review recommendations posted by consulting specialists and implement treatment alterations.
- **Senior Instructions**: Issue instructions and management plans to ward teams and junior doctors.

### Specialist
*Focus: Which cases need my expertise?*
- **New Referrals**: Inpatient and outpatient consultative referrals requesting specialty expertise.
- **Pending Consultations**: Track referred cases awaiting complete workup or diagnostic reporting.
- **Investigation Results**: Review diagnostic labs and specialized diagnostic imaging ordered for the consult.
- **Specialist Assessment**: Document formal specialty impressions and clinical findings.
- **Recommendations**: Issue structured treatment recommendations to the primary senior attending.
- **Follow-ups**: Monitor recommended interventions and review subsequent clinical trajectory.

---

## Shared Clinical Record

Healthagram is built on the foundation of a **single, unified clinical record per patient**.

Real hospital care does not follow a rigid, unidirectional junior → senior → specialist sequence. A clinical case may involve:
- Direct senior-led admissions
- Junior bedside assessment with senior escalation
- Immediate specialist consultations requested directly
- Multi-way collaborative reviews and cross-shift handovers

Healthagram accommodates flexible medical care. Every clinical action—whether prescribing a drug, recording a vital sign, documenting a nursing administration, reporting an investigation result, or submitting a specialist recommendation—is appended as an event to the patient's continuous clinical history.

---

## Senior Approach

Senior Approach allows senior attending physicians to document and share how they managed complex clinical cases.

Each approach captures:
- **Clinical Situation**: Presenting symptoms, baseline context, and active complications.
- **Senior Assessment**: Diagnostic reasoning and differential evaluation.
- **Senior Decision**: The critical choice made at the clinical inflection point.
- **Treatment Approach**: Specific drug choice, dosage strategy, or intervention plan.
- **Reasoning**: Why the decision was chosen over alternative medical options.
- **Outcome / Follow-up**: Patient trajectory, response, and clinical resolution.

Senior Approach is **not** a simulated scenario or duplicate clinical file. It links foreign keys directly to the live patient record, enabling junior doctors to transition between reading the senior doctor's rationale and inspecting the underlying clinical file.

---

## Core Clinical Modules

- **Authentication & Role-Based Access**: Role-guarded permissions (`JUNIOR_DOCTOR`, `SENIOR_DOCTOR`, `SPECIALIST`) enforced at the API route and database layers.
- **Patients**: Comprehensive demographic, allergy alert, and encounter status records.
- **Encounters**: Inpatient admissions, outpatient consults, and emergency episodes.
- **Clinical Timeline & Events**: Immutable, timestamped chronological log of assessments, vitals, and progress notes.
- **Prescriptions**: Prescription orders with dose, route, frequency, and mandatory lineage tracking on modification.
- **Medication Administration**: Administration logging confirming dose delivery, withholding, or patient refusal.
- **Investigations & Results**: Diagnostic orders (laboratory and radiology) with result values, reference ranges, and doctor impressions.
- **Specialist Referrals**: Specialty consult requests, urgency statuses, and specialist recommendation notes.
- **Clinical Communication**: Patient-linked instructions, cross-shift handover notes, and urgent team updates.
- **Notifications**: Role-targeted clinical notifications triggered by vital updates, new results, and prescription modifications.
- **Care Team & Assignments**: Multidisciplinary doctor assignments and primary attending tracking.
- **Audit Logs**: Regulatory audit trail capturing user identity, timestamp, action type, and affected entity for all modifications.
- **Senior Approach**: Knowledge preservation module linking attending decision rationales to live patient charts.

---

## Technology

- **Frontend**:
  - React 18 (`react`, `react-dom`)
  - TypeScript
  - Vite 6
  - Lucide React (icons)
  - Vanilla CSS design system with custom medical tokens
- **Backend**:
  - Node.js (v18+)
  - Express.js 4 (`express`)
  - TypeScript (`typescript`, `tsx`)
  - Prisma ORM 6 (`@prisma/client`, `prisma`)
  - SQLite database
  - JWT authentication (`jsonwebtoken`)
  - Password hashing (`bcryptjs`)
  - Schema validation (`zod`)
  - Security headers (`helmet`, `cors`)
- **Monorepo / Workspace**:
  - NPM Workspaces (`client`, `server`)
  - Concurrently (parallel process orchestration)

---

## Current Project Structure

```text
Healthagram/
├── client/                     # Vite React Frontend
│   ├── public/                 # Static assets (clean hero WebP)
│   ├── src/
│   │   ├── components/         # Clinical role dashboards & patient workspace tabs
│   │   │   ├── LandingPage.tsx          # Full-screen landing page
│   │   │   ├── Header.tsx               # Top clinical navigation & doctor switcher
│   │   │   ├── PatientSidebar.tsx       # Searchable assigned patient list
│   │   │   ├── JuniorDashboard.tsx      # Tasks, clinical updates, patient overview
│   │   │   ├── SeniorDashboard.tsx      # Reviews, junior requests, result reviews
│   │   │   ├── SpecialistDashboard.tsx  # Referrals, pending consults, follow-ups
│   │   │   ├── SharedPatientPage.tsx    # Single shared clinical record view
│   │   │   ├── SeniorApproachSection.tsx# Junior reference library for senior cases
│   │   │   ├── PrescriptionsTab.tsx     # Medication management & administration
│   │   │   ├── InvestigationsTab.tsx    # Lab and imaging diagnostic tracking
│   │   │   ├── ReferralsTab.tsx         # Specialist consultations & recommendations
│   │   │   ├── TimelineTab.tsx          # Chronological clinical event stream
│   │   │   ├── CommunicationsTab.tsx    # Shift handovers & team instructions
│   │   │   ├── CareTeamTab.tsx          # Care team member management
│   │   │   ├── AuditTab.tsx             # Regulatory clinical audit log
│   │   │   └── Modals.tsx               # Clinical action dialogs
│   │   ├── api.ts              # Type-safe API client
│   │   ├── types.ts            # Shared TypeScript domain models
│   │   ├── App.tsx             # Root router & global clinical state
│   │   ├── main.tsx            # Application entrypoint
│   │   └── index.css           # Clinical design system tokens & styling
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Express TypeScript Backend
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema & clinical entity relations
│   │   ├── seed.ts             # Realistic clinical seed data
│   │   └── dev.db              # SQLite database file
│   ├── scripts/
│   │   └── test-workflow.ts    # 22-step automated clinical workflow test suite
│   ├── src/
│   │   ├── middleware/         # JWT authentication, role authorization, error handling
│   │   ├── modules/            # Domain controllers & services
│   │   │   ├── auth/           # Login, token validation, user profile
│   │   │   ├── patients/       # Patient records & "What Changed" detection
│   │   │   ├── encounters/     # Clinical encounters & admission episodes
│   │   │   ├── events/         # Clinical timeline & progress notes
│   │   │   ├── prescriptions/  # Prescriptions, modifications, administrations
│   │   │   ├── investigations/ # Diagnostic orders & laboratory/radiology results
│   │   │   ├── referrals/      # Specialist consultation requests & reports
│   │   │   ├── communications/ # Patient-linked handover & clinical messages
│   │   │   ├── notifications/  # Role alerts & notification queues
│   │   │   ├── care-team/      # Patient care team doctor assignments
│   │   │   ├── senior-approach/# Attending clinical decision case guides
│   │   │   └── audit/          # Regulatory immutable audit logs
│   │   ├── db/                 # Prisma database client instance
│   │   └── index.ts            # Express server initialization
│   ├── package.json
│   └── tsconfig.json
├── package.json                # Root NPM workspace configuration
└── README.md
```

---

## Running the Project

### Prerequisites
- Node.js (version 18 or higher)
- npm (version 9 or higher)

### Setup & Installation

1. **Install dependencies across all workspaces**:
   ```bash
   npm install
   ```

2. **Initialize and seed the database**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

3. **Start development servers (Frontend + Backend concurrently)**:
   ```bash
   npm run dev
   ```
   - **Frontend application**: `http://localhost:5173/`
   - **Backend API**: `http://localhost:5000/api`

### Individual Workspace Commands

- **Run backend server only**:
  ```bash
  npm run dev:server
  ```
- **Run frontend client only**:
  ```bash
  npm run dev:client
  ```
- **Build production bundles**:
  ```bash
  npm run build
  ```
- **Run the automated 22-step clinical workflow test**:
  ```bash
  npm run test:workflow
  ```

---

## Important Design Principle

"Healthagram is built around one shared clinical record, role-specific workflows, a chronological clinical timeline, and optional preservation of senior clinical approaches."
