import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Healthagram Clinical Database with South Indian Practitioners & Patients ---');

  // Clean existing tables in proper relational cascade order
  await prisma.patientViewAudit.deleteMany();
  await prisma.seniorApproach.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.clinicalCommunication.deleteMany();
  await prisma.specialistReferral.deleteMany();
  await prisma.investigationResult.deleteMany();
  await prisma.investigation.deleteMany();
  await prisma.medicationAdministration.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.clinicalEvent.deleteMany();
  await prisma.patientAssignment.deleteMany();
  await prisma.encounter.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.user.deleteMany();

  const commonPassword = await bcrypt.hash('Password123!', 10);

  // 1. Create Doctors with realistic South Indian names
  console.log('Creating clinical practitioners...');

  // Junior Doctor 1: Dr. Ananya
  const juniorAnanya = await prisma.user.create({
    data: {
      email: 'ananya@healthagram.clinic',
      passwordHash: commonPassword,
      role: UserRole.JUNIOR_DOCTOR,
      firstName: 'Ananya',
      lastName: 'Ramaswamy',
      phoneNumber: '+91-98401-11001',
      doctorProfile: {
        create: {
          specialization: 'Internal Medicine (Resident)',
          licenseNumber: 'TN-MED-8821',
          department: 'Acute Assessment Unit',
          rank: 'Junior Resident (PGY-2)',
          pagerOrPhone: 'Duty Mobile #101'
        }
      }
    }
  });

  // Junior Doctor 2: Dr. Praveen
  const juniorPraveen = await prisma.user.create({
    data: {
      email: 'praveen@healthagram.clinic',
      passwordHash: commonPassword,
      role: UserRole.JUNIOR_DOCTOR,
      firstName: 'Praveen',
      lastName: 'Natarajan',
      phoneNumber: '+91-98401-11002',
      doctorProfile: {
        create: {
          specialization: 'General Medicine (Resident)',
          licenseNumber: 'TN-MED-9014',
          department: 'Inpatient Medical Wards',
          rank: 'Foundation Resident (PGY-1)',
          pagerOrPhone: 'Duty Mobile #102'
        }
      }
    }
  });

  // Senior Doctor 1: Dr. Suresh
  const seniorSuresh = await prisma.user.create({
    data: {
      email: 'suresh@healthagram.clinic',
      passwordHash: commonPassword,
      role: UserRole.SENIOR_DOCTOR,
      firstName: 'Suresh',
      lastName: 'Venkatraman',
      phoneNumber: '+91-98401-22001',
      doctorProfile: {
        create: {
          specialization: 'Acute & Emergency Medicine',
          licenseNumber: 'TN-CON-4412',
          department: 'Acute Assessment & Resuscitation',
          rank: 'Senior Attending Consultant',
          pagerOrPhone: 'Direct Ext #201'
        }
      }
    }
  });

  // Senior Doctor 2: Dr. Divya
  const seniorDivya = await prisma.user.create({
    data: {
      email: 'divya@healthagram.clinic',
      passwordHash: commonPassword,
      role: UserRole.SENIOR_DOCTOR,
      firstName: 'Divya',
      lastName: 'Subramanian',
      phoneNumber: '+91-98401-22002',
      doctorProfile: {
        create: {
          specialization: 'Internal Medicine',
          licenseNumber: 'TN-CON-3108',
          department: 'Internal Medicine Services',
          rank: 'Consultant Physician & Professor',
          pagerOrPhone: 'Direct Ext #205'
        }
      }
    }
  });

  // Specialist 1: Dr. Swetha (Cardiology)
  const specSwetha = await prisma.user.create({
    data: {
      email: 'swetha@healthagram.clinic',
      passwordHash: commonPassword,
      role: UserRole.SPECIALIST,
      firstName: 'Swetha',
      lastName: 'Balasubramanian',
      phoneNumber: '+91-98401-33001',
      doctorProfile: {
        create: {
          specialization: 'Cardiology & Electrophysiology',
          licenseNumber: 'TN-SPC-1190',
          department: 'Cardiovascular Care Unit',
          rank: 'Senior Specialist Consultant',
          pagerOrPhone: 'Cath Lab Direct #301'
        }
      }
    }
  });

  // Specialist 2: Dr. Anand (Neurology)
  const specAnand = await prisma.user.create({
    data: {
      email: 'anand@healthagram.clinic',
      passwordHash: commonPassword,
      role: UserRole.SPECIALIST,
      firstName: 'Anand',
      lastName: 'Krishnan',
      phoneNumber: '+91-98401-33002',
      doctorProfile: {
        create: {
          specialization: 'Neurology & Stroke Medicine',
          licenseNumber: 'TN-SPC-2847',
          department: 'Neurosciences Department',
          rank: 'Consultant Neurologist',
          pagerOrPhone: 'Neuro Direct #304'
        }
      }
    }
  });

  console.log('Doctors created successfully.');

  // 2. Create 5 Patients with South Indian Names
  console.log('Creating clinical patients...');

  const patientMeenakshi = await prisma.patient.create({
    data: {
      mrn: 'PAT-1001',
      name: 'Meenakshi',
      dateOfBirth: new Date('1958-03-14'),
      age: 68,
      gender: 'Female',
      contact: '+91-98400-50001',
      allergies: 'Penicillin (severe hives, anaphylactoid reaction)',
      medicalHistory: 'Hypertension (10 yrs), Paroxysmal Atrial Fibrillation, Type 2 Diabetes Mellitus'
    }
  });

  const patientRaghav = await prisma.patient.create({
    data: {
      mrn: 'PAT-1002',
      name: 'Raghav Kumar',
      dateOfBirth: new Date('1974-08-22'),
      age: 52,
      gender: 'Male',
      contact: '+91-98400-50002',
      allergies: 'Sulfa antibiotics, Aspirin (causes bronchospasm)',
      medicalHistory: 'Coronary Artery Disease, Hyperlipidemia, Essential Hypertension'
    }
  });

  const patientArjun = await prisma.patient.create({
    data: {
      mrn: 'PAT-1003',
      name: 'Arjun Raj',
      dateOfBirth: new Date('1984-11-05'),
      age: 42,
      gender: 'Male',
      contact: '+91-98400-50003',
      allergies: 'No known drug allergies (NKDA)',
      medicalHistory: 'Refractory Chronic Migraine with visual aura'
    }
  });

  const patientKarthik = await prisma.patient.create({
    data: {
      mrn: 'PAT-1004',
      name: 'Karthik',
      dateOfBirth: new Date('1951-01-30'),
      age: 75,
      gender: 'Male',
      contact: '+91-98400-50004',
      allergies: 'Codeine (severe nausea, disorientation)',
      medicalHistory: 'Chronic Obstructive Pulmonary Disease (GOLD Stage II), Chronic Kidney Disease Stage 3'
    }
  });

  const patientSaranya = await prisma.patient.create({
    data: {
      mrn: 'PAT-1005',
      name: 'Saranya',
      dateOfBirth: new Date('1997-06-19'),
      age: 29,
      gender: 'Female',
      contact: '+91-98400-50005',
      allergies: 'Latex',
      medicalHistory: 'Hashimoto Hypothyroidism, post-viral sinus palpitations'
    }
  });

  console.log('Patients created successfully.');

  // 3. SEED RICH MULTI-DOCTOR WORKFLOW FOR PATIENT MEENAKSHI (PAT-1001)
  console.log('Seeding multi-doctor workflow on Meenakshi (PAT-1001)...');

  const encounterMeenakshi = await prisma.encounter.create({
    data: {
      patientId: patientMeenakshi.id,
      type: 'EMERGENCY',
      reason: 'Acute palpitations, shortness of breath, and diaphoresis',
      status: 'ACTIVE',
      startTime: new Date('2026-10-05T08:30:00Z'),
      createdById: seniorSuresh.id
    }
  });

  await prisma.patientAssignment.createMany({
    data: [
      {
        patientId: patientMeenakshi.id,
        doctorId: seniorSuresh.id,
        role: UserRole.SENIOR_DOCTOR,
        isPrimary: true,
        notes: 'Lead Attending Physician for acute admission'
      },
      {
        patientId: patientMeenakshi.id,
        doctorId: juniorAnanya.id,
        role: UserRole.JUNIOR_DOCTOR,
        isPrimary: false,
        notes: 'Primary resident on morning shift'
      },
      {
        patientId: patientMeenakshi.id,
        doctorId: specSwetha.id,
        role: UserRole.SPECIALIST,
        isPrimary: false,
        notes: 'Consulting Cardiologist'
      }
    ]
  });

  // Timeline Event 1: Initial Assessment by Junior Dr. Ananya
  await prisma.clinicalEvent.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      eventType: 'ASSESSMENT',
      title: 'Initial Clinical Assessment & Vitals',
      description: 'Patient presented with rapid, irregular palpitations. BP: 142/88 mmHg, HR: 128 bpm (irregular), SpO2: 96% on room air, Temp: 37.1 C. Alert, oriented x 3.',
      createdById: juniorAnanya.id,
      createdAt: new Date('2026-10-05T08:45:00Z'),
      metadata: JSON.stringify({ bp: '142/88', hr: 128, spo2: 96, temp: 37.1 })
    }
  });

  // Timeline Event 2: Junior orders STAT Troponin and ECG
  const ecgInvestigation = await prisma.investigation.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      orderedById: juniorAnanya.id,
      type: 'LAB',
      title: 'High-Sensitivity Troponin I & Serum Electrolytes',
      clinicalIndication: 'Exclude acute coronary syndrome in symptomatic rapid atrial fibrillation',
      priority: 'STAT',
      status: 'COMPLETED',
      orderedAt: new Date('2026-10-05T09:00:00Z')
    }
  });

  await prisma.clinicalEvent.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      eventType: 'INVESTIGATION_ORDERED',
      title: 'Investigation Ordered: HS-Troponin I & Electrolytes (STAT)',
      description: 'Ordered by Dr. Ananya to exclude acute myocardial injury.',
      createdById: juniorAnanya.id,
      createdAt: new Date('2026-10-05T09:00:00Z')
    }
  });

  const ecgResult = await prisma.investigationResult.create({
    data: {
      investigationId: ecgInvestigation.id,
      reportedById: juniorAnanya.id,
      findings: 'Troponin I: 11 ng/L (Normal <14 ng/L). Potassium: 4.2 mmol/L. Magnesium: 0.90 mmol/L.',
      values: JSON.stringify({ troponin_I: 11, potassium: 4.2, magnesium: 0.90 }),
      impressions: 'No biomarker evidence of acute infarction. Electrolytes normal.',
      status: 'FINAL',
      createdAt: new Date('2026-10-05T09:40:00Z')
    }
  });

  await prisma.clinicalEvent.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      eventType: 'LAB_RESULT',
      title: 'Lab Result Available: HS-Troponin I Normal',
      description: 'HS-Troponin I: 11 ng/L. Potassium: 4.2 mmol/L.',
      createdById: juniorAnanya.id,
      createdAt: new Date('2026-10-05T09:42:00Z')
    }
  });

  // Timeline Event 3: Senior Review by Dr. Suresh
  await prisma.clinicalEvent.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      eventType: 'ASSESSMENT',
      title: 'Senior Attending Ward Review: Dr. Suresh',
      description: 'Reviewed 12-lead ECG demonstrating Atrial Fibrillation with rapid ventricular response (ventricular rate ~130 bpm). Normotensive. Commencing rate control with oral Metoprolol tartrate.',
      createdById: seniorSuresh.id,
      createdAt: new Date('2026-10-05T10:00:00Z')
    }
  });

  // Timeline Event 4: Senior prescribes Metoprolol
  const rxMetoprolol = await prisma.prescription.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      prescribedById: seniorSuresh.id,
      medication: 'Metoprolol Tartrate',
      dosage: '25 mg',
      frequency: 'Twice daily',
      route: 'Oral',
      duration: '5 days',
      instructions: 'Target resting heart rate < 90 bpm. Hold if systolic BP < 100 or HR < 55.',
      status: 'CHANGED',
      stoppedAt: new Date('2026-10-05T12:45:00Z'),
      changeReason: 'Airway reactivity noted; switched to Diltiazem per Specialist Cardiology recommendation',
      changedById: seniorSuresh.id,
      createdAt: new Date('2026-10-05T10:15:00Z')
    }
  });

  await prisma.clinicalEvent.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      eventType: 'PRESCRIPTION',
      title: 'Prescription Created: Metoprolol Tartrate 25 mg',
      description: 'Prescribed by Dr. Suresh for ventricular rate control in atrial fibrillation.',
      createdById: seniorSuresh.id,
      createdAt: new Date('2026-10-05T10:15:00Z')
    }
  });

  // Timeline Event 5: Senior Instruction to Junior Dr. Ananya
  await prisma.clinicalCommunication.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      senderId: seniorSuresh.id,
      receiverId: juniorAnanya.id,
      type: 'SENIOR_INSTRUCTION',
      subject: 'Administer Metoprolol and re-check telemetry in 45 mins',
      content: 'Please administer first dose of Metoprolol Tartrate 25mg PO now. Repeat BP and pulse at 11:00. Note any bronchospasm given mild history.',
      priority: 'URGENT',
      isAcknowledged: true,
      acknowledgedAt: new Date('2026-10-05T10:20:00Z'),
      createdAt: new Date('2026-10-05T10:18:00Z')
    }
  });

  await prisma.clinicalEvent.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      eventType: 'SENIOR_INSTRUCTION',
      title: 'Senior Instruction: Metoprolol administration & telemetry check',
      description: 'Dr. Suresh directed Dr. Ananya to administer dose and monitor vitals.',
      createdById: seniorSuresh.id,
      createdAt: new Date('2026-10-05T10:18:00Z')
    }
  });

  // Timeline Event 6: Junior Dr. Ananya Administers Metoprolol
  const adminMetoprolol = await prisma.medicationAdministration.create({
    data: {
      prescriptionId: rxMetoprolol.id,
      patientId: patientMeenakshi.id,
      administeredById: juniorAnanya.id,
      administeredAt: new Date('2026-10-05T10:30:00Z'),
      dose: '25 mg oral tablet',
      status: 'GIVEN',
      notes: 'Patient took dose with water. No immediate distress.'
    }
  });

  await prisma.clinicalEvent.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      eventType: 'MEDICATION_ADMINISTERED',
      title: 'Medication Administered: Metoprolol Tartrate (25 mg)',
      description: 'Administered by Dr. Ananya at 10:30. Vital signs prior: BP 138/84, HR 122 bpm.',
      createdById: juniorAnanya.id,
      createdAt: new Date('2026-10-05T10:30:00Z')
    }
  });

  // Timeline Event 7: Junior Observation: Wheeze / Airway Reactivity
  await prisma.clinicalEvent.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      eventType: 'ASSESSMENT',
      title: 'Junior Observation: Post-Administration Wheeze & Chest Tightness',
      description: 'Post-dose re-evaluation: HR decreased to 112 bpm. Patient reports mild chest tightness; auscultation reveals subtle bilateral expiratory wheeze (suspected beta-blocker induced airway reactivity).',
      createdById: juniorAnanya.id,
      createdAt: new Date('2026-10-05T11:15:00Z'),
      metadata: JSON.stringify({ hr: 112, symptom: 'subtle expiratory wheeze' })
    }
  });

  // Timeline Event 8: Senior requests Specialist Referral (Dr. Swetha - Cardiology)
  const referralMeenakshi = await prisma.specialistReferral.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      referringDoctorId: seniorSuresh.id,
      specialistId: specSwetha.id,
      reason: 'Symptomatic Paroxysmal AFib with RVR. Mild reactive airway response following beta-blocker initiation. Request expert rate-control guidance.',
      priority: 'URGENT',
      status: 'COMPLETED',
      recommendation: 'Recommend switching from Metoprolol to non-dihydropyridine calcium channel blocker: Diltiazem 30 mg TID orally. Start Apixaban 5 mg BID for stroke thromboprophylaxis (CHA2DS2-VASc = 4). Schedule 24h Holter and Echo.',
      recommendationAt: new Date('2026-10-05T12:30:00Z'),
      createdAt: new Date('2026-10-05T11:30:00Z')
    }
  });

  await prisma.clinicalEvent.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      eventType: 'SPECIALIST_REFERRAL',
      title: 'Specialist Referral: Cardiology (Dr. Swetha)',
      description: 'Referred by Dr. Suresh for expert rate control management in setting of reactive airways.',
      createdById: seniorSuresh.id,
      createdAt: new Date('2026-10-05T11:30:00Z')
    }
  });

  // Timeline Event 9: Specialist Recommendation by Dr. Swetha
  await prisma.clinicalEvent.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      eventType: 'SPECIALIST_REVIEW',
      title: 'Specialist Review & Recommendation: Dr. Swetha (Cardiology)',
      description: 'Cardiology Consultation: "Recommend switching from Metoprolol to Diltiazem 30 mg TID orally to avoid beta-2 mediated bronchospasm. Add Apixaban 5mg BID (CHA2DS2-VASc score 4). Outpatient Echo ordered."',
      createdById: specSwetha.id,
      createdAt: new Date('2026-10-05T12:30:00Z')
    }
  });

  // Timeline Event 10: Senior changes treatment (Lineage Preserved!)
  const rxDiltiazem = await prisma.prescription.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      prescribedById: seniorSuresh.id,
      medication: 'Diltiazem Hydrochloride',
      dosage: '30 mg',
      frequency: 'Three times daily',
      route: 'Oral',
      duration: '7 days',
      instructions: 'Take before meals. Check pulse and blood pressure before each dose.',
      status: 'ACTIVE',
      previousPrescriptionId: rxMetoprolol.id,
      createdAt: new Date('2026-10-05T12:45:00Z')
    }
  });

  await prisma.clinicalEvent.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      eventType: 'MEDICATION_CHANGED',
      title: 'Medication Changed: Metoprolol Tartrate → Diltiazem Hydrochloride',
      description: 'Metoprolol 25 mg stopped due to airway reactivity. Diltiazem 30 mg TID commenced following Cardiology recommendation.',
      createdById: seniorSuresh.id,
      createdAt: new Date('2026-10-05T12:45:00Z'),
      metadata: JSON.stringify({
        oldPrescriptionId: rxMetoprolol.id,
        newPrescriptionId: rxDiltiazem.id,
        reason: 'Airway reactivity'
      })
    }
  });

  await prisma.clinicalEvent.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      eventType: 'TREATMENT_CHANGE',
      title: 'Treatment Regimen Altered',
      description: 'Transitioned rate control from beta-blockade to calcium channel blockade.',
      createdById: seniorSuresh.id,
      createdAt: new Date('2026-10-05T12:46:00Z')
    }
  });

  // Timeline Event 11: Junior Dr. Ananya administers NEW medication (Diltiazem)
  const adminDiltiazem = await prisma.medicationAdministration.create({
    data: {
      prescriptionId: rxDiltiazem.id,
      patientId: patientMeenakshi.id,
      administeredById: juniorAnanya.id,
      administeredAt: new Date('2026-10-05T13:00:00Z'),
      dose: '30 mg oral tablet',
      status: 'GIVEN',
      notes: 'Administered new medication Diltiazem. Patient tolerating well, chest tightness resolved.'
    }
  });

  await prisma.clinicalEvent.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      eventType: 'MEDICATION_ADMINISTERED',
      title: 'Medication Administered: Diltiazem Hydrochloride (30 mg)',
      description: 'Administered by Dr. Ananya. BP 128/78, HR 86 bpm (controlled). Patient reports breathing comfortably.',
      createdById: juniorAnanya.id,
      createdAt: new Date('2026-10-05T13:00:00Z')
    }
  });

  // 4. SEED SENIOR APPROACH CASES
  console.log('Seeding Senior Approach cases...');

  await prisma.seniorApproach.create({
    data: {
      patientId: patientMeenakshi.id,
      encounterId: encounterMeenakshi.id,
      seniorDoctorId: seniorSuresh.id,
      title: 'Managing Paroxysmal AFib with RVR in Patients with Reactive Airway Symptoms',
      situation: 'Elderly patient presented with acute onset palpitations, irregular tachycardia ~130 bpm, developing subtle expiratory wheezing following first-line beta-blockade.',
      assessment: 'Rate control is essential in symptomatic AFib with RVR, but even cardioselective beta-blockers can unmask latent bronchospasm in susceptible patients.',
      decision: 'Requested immediate cardiology specialist consultation with Dr. Swetha, and promptly switched rate-control agent from Metoprolol to Diltiazem.',
      treatmentApproach: 'Transitioned to non-dihydropyridine calcium channel blocker (Diltiazem 30 mg TID orally) alongside stroke thromboprophylaxis.',
      reasoning: 'Calcium channel blockers provide safe atrioventricular nodal conduction slowing without blocking bronchial beta-2 receptors, avoiding respiratory compromise.',
      outcome: 'Heart rate stabilized within normal limits (84–88 bpm) within 2 hours. Expiratory wheeze resolved completely, and patient remained normotensive.',
      sharedAt: new Date('2026-10-05T14:00:00Z')
    }
  });

  // 5. Seed Patient Raghav Kumar (PAT-1002)
  console.log('Seeding Raghav Kumar (PAT-1002)...');

  const encounterRaghav = await prisma.encounter.create({
    data: {
      patientId: patientRaghav.id,
      type: 'INPATIENT',
      reason: 'Patient reports dizziness, chest discomfort, and fatigue for the past two days.',
      status: 'ACTIVE',
      startTime: new Date('2026-10-04T10:00:00Z'),
      createdById: seniorSuresh.id
    }
  });

  await prisma.patientAssignment.createMany({
    data: [
      {
        patientId: patientRaghav.id,
        doctorId: seniorSuresh.id,
        role: UserRole.SENIOR_DOCTOR,
        isPrimary: true,
        notes: 'Consultant Physician on Acute Medical Ward'
      },
      {
        patientId: patientRaghav.id,
        doctorId: juniorPraveen.id,
        role: UserRole.JUNIOR_DOCTOR,
        isPrimary: false,
        notes: 'Ward Resident'
      }
    ]
  });

  await prisma.clinicalEvent.create({
    data: {
      patientId: patientRaghav.id,
      encounterId: encounterRaghav.id,
      eventType: 'ASSESSMENT',
      title: 'Inpatient Evaluation: Dizziness and Exertional Angina',
      description: 'Patient reports dizziness, chest discomfort, and fatigue for the past two days. BP 154/92 mmHg, HR 78 bpm. Ordered urgent lipid profile, liver function tests, and resting ECG.',
      createdById: seniorSuresh.id,
      createdAt: new Date('2026-10-04T10:15:00Z')
    }
  });

  const rxAtorvastatin = await prisma.prescription.create({
    data: {
      patientId: patientRaghav.id,
      encounterId: encounterRaghav.id,
      prescribedById: seniorSuresh.id,
      medication: 'Atorvastatin',
      dosage: '40 mg',
      frequency: 'Once at night',
      route: 'Oral',
      duration: '30 days',
      instructions: 'Take before sleep.',
      status: 'ACTIVE',
      createdAt: new Date('2026-10-04T11:00:00Z')
    }
  });

  const rxAmlodipine = await prisma.prescription.create({
    data: {
      patientId: patientRaghav.id,
      encounterId: encounterRaghav.id,
      prescribedById: seniorSuresh.id,
      medication: 'Amlodipine',
      dosage: '5 mg',
      frequency: 'Once daily (morning)',
      route: 'Oral',
      duration: '30 days',
      instructions: 'Monitor blood pressure weekly.',
      status: 'ACTIVE',
      createdAt: new Date('2026-10-04T11:05:00Z')
    }
  });

  await prisma.medicationAdministration.create({
    data: {
      prescriptionId: rxAtorvastatin.id,
      patientId: patientRaghav.id,
      administeredById: juniorPraveen.id,
      administeredAt: new Date('2026-10-04T21:00:00Z'),
      dose: '40 mg oral tablet',
      status: 'GIVEN',
      notes: 'Evening dose taken with water.'
    }
  });

  const lipidInv = await prisma.investigation.create({
    data: {
      patientId: patientRaghav.id,
      encounterId: encounterRaghav.id,
      orderedById: seniorSuresh.id,
      type: 'LAB',
      title: 'Fasting Lipid Profile & Serum Transaminases',
      clinicalIndication: 'Assess cardiovascular risk profile and statin baseline',
      priority: 'ROUTINE',
      status: 'COMPLETED',
      orderedAt: new Date('2026-10-04T10:30:00Z')
    }
  });

  await prisma.investigationResult.create({
    data: {
      investigationId: lipidInv.id,
      reportedById: juniorPraveen.id,
      findings: 'Total Cholesterol: 242 mg/dL. LDL-C: 164 mg/dL (Elevated). HDL-C: 38 mg/dL. Triglycerides: 200 mg/dL.',
      values: JSON.stringify({ ldl: 164, total_cholesterol: 242, hdl: 38, tg: 200 }),
      impressions: 'Mixed hyperlipidemia with elevated atherogenic LDL cholesterol.',
      status: 'FINAL',
      createdAt: new Date('2026-10-04T16:00:00Z')
    }
  });

  // 6. Seed Patient Arjun Raj (PAT-1003) - Neurology Consultation
  console.log('Seeding Arjun Raj (PAT-1003)...');

  const encounterArjun = await prisma.encounter.create({
    data: {
      patientId: patientArjun.id,
      type: 'CONSULTATION',
      reason: 'Frequent intractable hemicranial headaches with visual scotoma',
      status: 'ACTIVE',
      startTime: new Date('2026-10-03T11:00:00Z'),
      createdById: seniorDivya.id
    }
  });

  await prisma.specialistReferral.create({
    data: {
      patientId: patientArjun.id,
      encounterId: encounterArjun.id,
      referringDoctorId: seniorDivya.id,
      specialistId: specAnand.id,
      reason: 'Refractory migraine failing first-line simple analgesics. Neuro-imaging clearance and prophylaxis advice requested.',
      priority: 'ROUTINE',
      status: 'COMPLETED',
      recommendation: 'MRI brain unremarkable for structural pathology or vascular malformation. Commenced on Topiramate 25 mg daily titration.',
      recommendationAt: new Date('2026-10-04T15:00:00Z')
    }
  });

  // 7. Seed Patient Karthik (PAT-1004) - Senior Approach Case 2
  console.log('Seeding Karthik (PAT-1004)...');

  const encounterKarthik = await prisma.encounter.create({
    data: {
      patientId: patientKarthik.id,
      type: 'INPATIENT',
      reason: 'Acute infective exacerbation of COPD with borderline renal function',
      status: 'ACTIVE',
      startTime: new Date('2026-10-02T09:00:00Z'),
      createdById: seniorDivya.id
    }
  });

  await prisma.patientAssignment.createMany({
    data: [
      {
        patientId: patientKarthik.id,
        doctorId: seniorDivya.id,
        role: UserRole.SENIOR_DOCTOR,
        isPrimary: true
      },
      {
        patientId: patientKarthik.id,
        doctorId: juniorPraveen.id,
        role: UserRole.JUNIOR_DOCTOR,
        isPrimary: false
      }
    ]
  });

  await prisma.clinicalCommunication.create({
    data: {
      patientId: patientKarthik.id,
      encounterId: encounterKarthik.id,
      senderId: seniorDivya.id,
      receiverId: juniorPraveen.id,
      type: 'SENIOR_INSTRUCTION',
      subject: 'Strict renal precautions: Avoid NSAIDs, titrate nebulizers',
      content: 'Baseline serum creatinine is 1.9 mg/dL (eGFR ~34). Ensure strict avoidance of NSAIDs and aminoglycosides. Titrate Ipratropium nebulae every 4 hours.',
      priority: 'URGENT',
      isAcknowledged: true,
      acknowledgedAt: new Date('2026-10-02T10:00:00Z')
    }
  });

  await prisma.seniorApproach.create({
    data: {
      patientId: patientKarthik.id,
      encounterId: encounterKarthik.id,
      seniorDoctorId: seniorDivya.id,
      title: 'COPD Exacerbation Management with Baseline Stage 3 Chronic Kidney Disease',
      situation: 'Elderly male with severe dyspnea and wheezing in the setting of chronic renal impairment (baseline creatinine 1.9 mg/dL).',
      assessment: 'Acute infective exacerbation of COPD requiring aggressive bronchodilation while protecting vulnerable nephrons.',
      decision: 'Avoid systemic nephrotoxic medications; employ targeted inhaled bronchodilators with renal-adjusted oral steroid tapering.',
      treatmentApproach: 'Inhaled Ipratropium/Salbutamol + short-course oral Prednisolone (30 mg tapering) + Cefpodoxime renal dose.',
      reasoning: 'Protects fragile renal parenchyma while rapidly resolving bronchoconstriction and inflammatory airway edema.',
      outcome: 'Significant clinical improvement with clear lung fields on day 3; discharge serum creatinine stable at 1.8 mg/dL.',
      sharedAt: new Date('2026-10-04T12:00:00Z')
    }
  });

  // 8. Seed Patient Saranya (PAT-1005)
  console.log('Seeding Saranya (PAT-1005)...');

  await prisma.encounter.create({
    data: {
      patientId: patientSaranya.id,
      type: 'OUTPATIENT',
      reason: 'Post-viral sinus palpitations and heat sensitivity evaluation',
      status: 'ACTIVE',
      startTime: new Date('2026-10-01T14:00:00Z'),
      createdById: seniorSuresh.id
    }
  });

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: specSwetha.id,
        patientId: patientMeenakshi.id,
        type: 'SPECIALIST_REFERRAL',
        title: 'New Specialist Referral for Meenakshi',
        message: 'Dr. Suresh requested urgent cardiology opinion on rate control.',
        isRead: true
      },
      {
        userId: seniorSuresh.id,
        patientId: patientMeenakshi.id,
        type: 'SPECIALIST_RECOMMENDATION',
        title: 'Specialist Recommendation for Meenakshi',
        message: 'Dr. Swetha posted cardiology recommendation (switch to Diltiazem).',
        isRead: false
      },
      {
        userId: juniorAnanya.id,
        patientId: patientMeenakshi.id,
        type: 'MEDICATION_CHANGED',
        title: 'Medication Changed for Meenakshi',
        message: 'Switched from Metoprolol to Diltiazem 30 mg TID.',
        isRead: false
      },
      {
        userId: juniorPraveen.id,
        patientId: patientKarthik.id,
        type: 'SENIOR_INSTRUCTION',
        title: 'New Senior Instruction for Karthik',
        message: 'Dr. Divya issued strict renal precautions for nebulizer and fluid titration.',
        isRead: false
      }
    ]
  });

  console.log('--- Database seeding completed with South Indian names & Senior Approach cases! ---');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
