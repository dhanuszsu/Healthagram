import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    console.log('--- Seeding Healthagram Clinical Database ---');
    // Clean existing tables in proper order
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
    // 1. Create Doctors
    console.log('Creating clinical practitioners...');
    // Junior Doctor 1
    const juniorChen = await prisma.user.create({
        data: {
            email: 'alex.chen@healthagram.clinic',
            passwordHash: commonPassword,
            role: UserRole.JUNIOR_DOCTOR,
            firstName: 'Alex',
            lastName: 'Chen',
            phoneNumber: '+1-555-0101',
            doctorProfile: {
                create: {
                    specialization: 'Internal Medicine (Resident)',
                    licenseNumber: 'MD-RES-8821',
                    department: 'Acute Assessment Unit',
                    rank: 'Junior Resident (PGY-2)',
                    pagerOrPhone: 'Bleep #412'
                }
            }
        }
    });
    // Junior Doctor 2
    const juniorPatel = await prisma.user.create({
        data: {
            email: 'priya.patel@healthagram.clinic',
            passwordHash: commonPassword,
            role: UserRole.JUNIOR_DOCTOR,
            firstName: 'Priya',
            lastName: 'Patel',
            phoneNumber: '+1-555-0102',
            doctorProfile: {
                create: {
                    specialization: 'General Medicine (Resident)',
                    licenseNumber: 'MD-RES-9014',
                    department: 'Inpatient Medical Wards',
                    rank: 'Foundation House Officer (PGY-1)',
                    pagerOrPhone: 'Bleep #305'
                }
            }
        }
    });
    // Senior Doctor 1
    const seniorJenkins = await prisma.user.create({
        data: {
            email: 'sarah.jenkins@healthagram.clinic',
            passwordHash: commonPassword,
            role: UserRole.SENIOR_DOCTOR,
            firstName: 'Sarah',
            lastName: 'Jenkins',
            phoneNumber: '+1-555-0201',
            doctorProfile: {
                create: {
                    specialization: 'Acute & Emergency Medicine',
                    licenseNumber: 'MD-CON-4412',
                    department: 'Acute Assessment & Resuscitation',
                    rank: 'Attending Senior Consultant',
                    pagerOrPhone: 'SpeedDial #101'
                }
            }
        }
    });
    // Senior Doctor 2
    const seniorVance = await prisma.user.create({
        data: {
            email: 'marcus.vance@healthagram.clinic',
            passwordHash: commonPassword,
            role: UserRole.SENIOR_DOCTOR,
            firstName: 'Marcus',
            lastName: 'Vance',
            phoneNumber: '+1-555-0202',
            doctorProfile: {
                create: {
                    specialization: 'Internal Medicine',
                    licenseNumber: 'MD-CON-3108',
                    department: 'Internal Medicine Services',
                    rank: 'Head of Clinical Medicine / Consultant Physician',
                    pagerOrPhone: 'SpeedDial #105'
                }
            }
        }
    });
    // Specialist 1 - Cardiology
    const specRostova = await prisma.user.create({
        data: {
            email: 'elena.rostova@healthagram.clinic',
            passwordHash: commonPassword,
            role: UserRole.SPECIALIST,
            firstName: 'Elena',
            lastName: 'Rostova',
            phoneNumber: '+1-555-0301',
            doctorProfile: {
                create: {
                    specialization: 'Cardiology & Electrophysiology',
                    licenseNumber: 'MD-SPC-1190',
                    department: 'Cardiovascular Care',
                    rank: 'Senior Specialist Consultant',
                    pagerOrPhone: 'Cardiology Direct Ext 5501'
                }
            }
        }
    });
    // Specialist 2 - Neurology
    const specKim = await prisma.user.create({
        data: {
            email: 'david.kim@healthagram.clinic',
            passwordHash: commonPassword,
            role: UserRole.SPECIALIST,
            firstName: 'David',
            lastName: 'Kim',
            phoneNumber: '+1-555-0302',
            doctorProfile: {
                create: {
                    specialization: 'Neurology & Stroke Medicine',
                    licenseNumber: 'MD-SPC-2847',
                    department: 'Neurosciences',
                    rank: 'Consultant Neurologist',
                    pagerOrPhone: 'Neuro Direct Ext 6104'
                }
            }
        }
    });
    console.log('Doctors created successfully.');
    // 2. Create 5 Patients
    console.log('Creating clinical patients...');
    const patientA = await prisma.patient.create({
        data: {
            mrn: 'PAT-1001',
            name: 'Eleanor Vance',
            dateOfBirth: new Date('1958-03-14'),
            age: 68,
            gender: 'Female',
            contact: '+1-555-7001',
            allergies: 'Penicillin (severe hives, anaphylactoid reaction)',
            medicalHistory: 'Hypertension (10 yrs), Paroxysmal Atrial Fibrillation, Type 2 Diabetes Mellitus'
        }
    });
    const patientB = await prisma.patient.create({
        data: {
            mrn: 'PAT-1002',
            name: 'James Sterling',
            dateOfBirth: new Date('1972-08-22'),
            age: 54,
            gender: 'Male',
            contact: '+1-555-7002',
            allergies: 'Sulfa antibiotics, Aspirin (causes bronchospasm)',
            medicalHistory: 'Coronary Artery Disease (PCI with DES 2021), Hyperlipidemia'
        }
    });
    const patientC = await prisma.patient.create({
        data: {
            mrn: 'PAT-1003',
            name: 'Maya Lin',
            dateOfBirth: new Date('1984-11-05'),
            age: 42,
            gender: 'Female',
            contact: '+1-555-7003',
            allergies: 'No known drug allergies (NKDA)',
            medicalHistory: 'Refractory Chronic Migraine with aura, mild exercise-induced asthma'
        }
    });
    const patientD = await prisma.patient.create({
        data: {
            mrn: 'PAT-1004',
            name: 'Robert O\'Connor',
            dateOfBirth: new Date('1951-01-30'),
            age: 75,
            gender: 'Male',
            contact: '+1-555-7004',
            allergies: 'Codeine (nausea, severe disorientation)',
            medicalHistory: 'Chronic Obstructive Pulmonary Disease (GOLD Stage II), Chronic Kidney Disease Stage 3'
        }
    });
    const patientE = await prisma.patient.create({
        data: {
            mrn: 'PAT-1005',
            name: 'Sofia Al-Mansoor',
            dateOfBirth: new Date('1997-06-19'),
            age: 29,
            gender: 'Female',
            contact: '+1-555-7005',
            allergies: 'Latex',
            medicalHistory: 'Hashimoto Hypothyroidism, Post-COVID sinus tachycardia'
        }
    });
    console.log('Patients created successfully.');
    // 3. SEED RICH CLINICAL WORKFLOW ON PATIENT A ("Eleanor Vance")
    // Demonstrates: Junior, Senior, and Specialist interacting on the SAME record!
    console.log('Seeding multi-doctor workflow for Patient A...');
    // Encounter
    const encounterA = await prisma.encounter.create({
        data: {
            patientId: patientA.id,
            type: 'EMERGENCY',
            reason: 'Acute onset palpitations, shortness of breath, and diaphoresis',
            status: 'ACTIVE',
            startTime: new Date('2026-10-05T08:30:00Z'),
            createdById: seniorJenkins.id
        }
    });
    // Care Team for Patient A
    await prisma.patientAssignment.createMany({
        data: [
            {
                patientId: patientA.id,
                doctorId: seniorJenkins.id,
                role: UserRole.SENIOR_DOCTOR,
                isPrimary: true,
                notes: 'Lead Attending Physician for acute admission'
            },
            {
                patientId: patientA.id,
                doctorId: juniorChen.id,
                role: UserRole.JUNIOR_DOCTOR,
                isPrimary: false,
                notes: 'Primary resident on morning duty'
            },
            {
                patientId: patientA.id,
                doctorId: specRostova.id,
                role: UserRole.SPECIALIST,
                isPrimary: false,
                notes: 'Consulting Cardiologist'
            }
        ]
    });
    // Timeline Event 1: Admission & Initial Assessment (by Junior Dr. Alex Chen)
    await prisma.clinicalEvent.create({
        data: {
            patientId: patientA.id,
            encounterId: encounterA.id,
            eventType: 'ASSESSMENT',
            title: 'Initial Clinical Assessment & Vitals',
            description: 'Patient presented with rapid, irregular palpitations. BP: 142/88 mmHg, HR: 128 bpm (irregular), SpO2: 96% on room air, Temp: 37.1 C. Alert, oriented x 3.',
            createdById: juniorChen.id,
            createdAt: new Date('2026-10-05T08:45:00Z'),
            metadata: JSON.stringify({ bp: '142/88', hr: 128, spo2: 96, temp: 37.1 })
        }
    });
    // Timeline Event 2: Junior orders ECG and Troponin
    const ecgInvestigation = await prisma.investigation.create({
        data: {
            patientId: patientA.id,
            encounterId: encounterA.id,
            orderedById: juniorChen.id,
            type: 'LAB',
            title: 'High-Sensitivity Troponin I & Electrolytes',
            clinicalIndication: 'Exclude acute coronary syndrome in symptomatic AFib with RVR',
            priority: 'STAT',
            status: 'COMPLETED',
            orderedAt: new Date('2026-10-05T09:00:00Z')
        }
    });
    await prisma.clinicalEvent.create({
        data: {
            patientId: patientA.id,
            encounterId: encounterA.id,
            eventType: 'INVESTIGATION_ORDERED',
            title: 'Investigation Ordered: HS-Troponin I & Electrolytes (STAT)',
            description: 'Ordered by Dr. Alex Chen to exclude acute myocardial injury.',
            createdById: juniorChen.id,
            createdAt: new Date('2026-10-05T09:00:00Z'),
            metadata: JSON.stringify({ investigationId: ecgInvestigation.id, priority: 'STAT' })
        }
    });
    // Investigation Result
    const ecgResult = await prisma.investigationResult.create({
        data: {
            investigationId: ecgInvestigation.id,
            reportedById: juniorChen.id,
            findings: 'Troponin I: 12 ng/L (Normal <14 ng/L). Potassium: 4.1 mmol/L. Magnesium: 0.88 mmol/L.',
            values: JSON.stringify({ troponin_I: 12, potassium: 4.1, magnesium: 0.88 }),
            impressions: 'No biomarker evidence of acute infarction. Electrolytes within normal limits.',
            status: 'FINAL',
            createdAt: new Date('2026-10-05T09:40:00Z')
        }
    });
    await prisma.clinicalEvent.create({
        data: {
            patientId: patientA.id,
            encounterId: encounterA.id,
            eventType: 'LAB_RESULT',
            title: 'Lab Result Available: HS-Troponin I Normal',
            description: 'HS-Troponin I: 12 ng/L (Within reference range). Potassium 4.1 mmol/L.',
            createdById: juniorChen.id,
            createdAt: new Date('2026-10-05T09:42:00Z'),
            metadata: JSON.stringify({ resultId: ecgResult.id })
        }
    });
    // Timeline Event 3: Senior Review (Dr. Sarah Jenkins)
    await prisma.clinicalEvent.create({
        data: {
            patientId: patientA.id,
            encounterId: encounterA.id,
            eventType: 'ASSESSMENT',
            title: 'Senior Attending Ward Review: Dr. Sarah Jenkins',
            description: 'Reviewed 12-lead ECG demonstrating Atrial Fibrillation with rapid ventricular response (ventricular rate ~130 bpm). Normotensive. Commencing rate control with oral Metoprolol tartrate.',
            createdById: seniorJenkins.id,
            createdAt: new Date('2026-10-05T10:00:00Z')
        }
    });
    // Timeline Event 4: Senior prescribes Metoprolol
    const prescription1 = await prisma.prescription.create({
        data: {
            patientId: patientA.id,
            encounterId: encounterA.id,
            prescribedById: seniorJenkins.id,
            medication: 'Metoprolol Tartrate',
            dosage: '25 mg',
            frequency: 'Twice daily',
            route: 'Oral',
            duration: '5 days',
            instructions: 'Target resting heart rate < 90 bpm. Hold if systolic BP < 100 or HR < 55.',
            status: 'ACTIVE',
            createdAt: new Date('2026-10-05T10:15:00Z')
        }
    });
    await prisma.clinicalEvent.create({
        data: {
            patientId: patientA.id,
            encounterId: encounterA.id,
            eventType: 'PRESCRIPTION',
            title: 'Prescription Created: Metoprolol Tartrate 25 mg',
            description: 'Prescribed by Dr. Sarah Jenkins for ventricular rate control in atrial fibrillation.',
            createdById: seniorJenkins.id,
            createdAt: new Date('2026-10-05T10:15:00Z'),
            metadata: JSON.stringify({ prescriptionId: prescription1.id, medication: 'Metoprolol Tartrate' })
        }
    });
    // Timeline Event 5: Senior Instruction to Junior Doctor
    await prisma.clinicalCommunication.create({
        data: {
            patientId: patientA.id,
            encounterId: encounterA.id,
            senderId: seniorJenkins.id,
            receiverId: juniorChen.id,
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
            patientId: patientA.id,
            encounterId: encounterA.id,
            eventType: 'SENIOR_INSTRUCTION',
            title: 'Senior Instruction: Metoprolol administration & telemetry check',
            description: 'Dr. Sarah Jenkins directed Dr. Alex Chen to administer dose and monitor vitals.',
            createdById: seniorJenkins.id,
            createdAt: new Date('2026-10-05T10:18:00Z')
        }
    });
    // Timeline Event 6: Junior Dr. Alex Chen Administers Medication
    const admin1 = await prisma.medicationAdministration.create({
        data: {
            prescriptionId: prescription1.id,
            patientId: patientA.id,
            administeredById: juniorChen.id,
            administeredAt: new Date('2026-10-05T10:30:00Z'),
            dose: '25 mg oral tablet',
            status: 'GIVEN',
            notes: 'Patient took dose with water. No acute distress.'
        }
    });
    await prisma.clinicalEvent.create({
        data: {
            patientId: patientA.id,
            encounterId: encounterA.id,
            eventType: 'MEDICATION_ADMINISTERED',
            title: 'Medication Administered: Metoprolol Tartrate (25 mg)',
            description: 'Administered by Dr. Alex Chen at 10:30. Vital signs prior: BP 138/84, HR 122 bpm.',
            createdById: juniorChen.id,
            createdAt: new Date('2026-10-05T10:30:00Z'),
            metadata: JSON.stringify({ administrationId: admin1.id, status: 'GIVEN' })
        }
    });
    // Timeline Event 7: Junior observes mild wheeze after Metoprolol
    await prisma.clinicalEvent.create({
        data: {
            patientId: patientA.id,
            encounterId: encounterA.id,
            eventType: 'ASSESSMENT',
            title: 'Post-Administration Observation & Telemetry Check',
            description: 'Post-dose re-evaluation: HR decreased to 110 bpm. Patient reports mild chest tightness; auscultation reveals subtle bilateral expiratory wheeze (suspected beta-blocker induced airway reactivity).',
            createdById: juniorChen.id,
            createdAt: new Date('2026-10-05T11:15:00Z'),
            metadata: JSON.stringify({ hr: 110, observation: 'subtle expiratory wheeze' })
        }
    });
    // Timeline Event 8: Senior requests Specialist Referral (Dr. Elena Rostova - Cardiology)
    const referralA = await prisma.specialistReferral.create({
        data: {
            patientId: patientA.id,
            encounterId: encounterA.id,
            referringDoctorId: seniorJenkins.id,
            specialistId: specRostova.id,
            reason: 'Symptomatic Paroxysmal AFib with RVR. Mild reactive airway response following beta-blocker initiation. Request expert electrophysiology/rate-control advice.',
            priority: 'URGENT',
            status: 'COMPLETED',
            recommendation: 'Recommend switching from Metoprolol to non-dihydropyridine calcium channel blocker: Diltiazem 30 mg TID orally. Start Apixaban 5 mg BID for stroke thromboprophylaxis (CHA2DS2-VASc = 4). Schedule outpatient echocardiogram.',
            recommendationAt: new Date('2026-10-05T12:30:00Z'),
            createdAt: new Date('2026-10-05T11:30:00Z')
        }
    });
    await prisma.clinicalEvent.create({
        data: {
            patientId: patientA.id,
            encounterId: encounterA.id,
            eventType: 'SPECIALIST_REFERRAL',
            title: 'Specialist Referral Requested: Cardiology (Dr. Elena Rostova)',
            description: 'Referred by Dr. Sarah Jenkins for expert rate control management in setting of reactive airways.',
            createdById: seniorJenkins.id,
            createdAt: new Date('2026-10-05T11:30:00Z'),
            metadata: JSON.stringify({ referralId: referralA.id, specialist: 'Dr. Elena Rostova' })
        }
    });
    // Timeline Event 9: Specialist Review & Recommendation
    await prisma.clinicalEvent.create({
        data: {
            patientId: patientA.id,
            encounterId: encounterA.id,
            eventType: 'SPECIALIST_REVIEW',
            title: 'Specialist Review & Recommendation: Dr. Elena Rostova (Cardiology)',
            description: 'Cardiology Consultation: "Recommend switching from Metoprolol to Diltiazem 30 mg TID orally to avoid beta-2 mediated bronchospasm. Add Apixaban 5mg BID (CHA2DS2-VASc score 4). Outpatient Echo ordered."',
            createdById: specRostova.id,
            createdAt: new Date('2026-10-05T12:30:00Z'),
            metadata: JSON.stringify({ referralId: referralA.id, specialistId: specRostova.id })
        }
    });
    // Specialist also sends clinical communication to care team
    await prisma.clinicalCommunication.create({
        data: {
            patientId: patientA.id,
            encounterId: encounterA.id,
            senderId: specRostova.id,
            receiverId: seniorJenkins.id,
            type: 'SPECIALIST_RECOMMENDATION',
            subject: 'Cardiology opinion: Switch to Diltiazem & start Apixaban',
            content: 'I have reviewed Eleanor Vance and her telemetry. Concur with stopping Metoprolol. Diltiazem is safer given airway reactivity. I will review again tomorrow.',
            priority: 'URGENT',
            isAcknowledged: true,
            acknowledgedAt: new Date('2026-10-05T12:35:00Z'),
            createdAt: new Date('2026-10-05T12:31:00Z')
        }
    });
    // Timeline Event 10: Senior modifies treatment!
    // OLD PRESCRIPTION -> MEDICATION_CHANGED EVENT -> NEW PRESCRIPTION
    await prisma.prescription.update({
        where: { id: prescription1.id },
        data: {
            status: 'CHANGED',
            stoppedAt: new Date('2026-10-05T12:45:00Z'),
            changeReason: 'Airway reactivity noted; switching to Diltiazem per Specialist Cardiology recommendation',
            changedById: seniorJenkins.id
        }
    });
    const prescription2 = await prisma.prescription.create({
        data: {
            patientId: patientA.id,
            encounterId: encounterA.id,
            prescribedById: seniorJenkins.id,
            medication: 'Diltiazem Hydrochloride',
            dosage: '30 mg',
            frequency: 'Three times daily',
            route: 'Oral',
            duration: '7 days',
            instructions: 'Take before meals. Check pulse and blood pressure before each dose.',
            status: 'ACTIVE',
            previousPrescriptionId: prescription1.id,
            createdAt: new Date('2026-10-05T12:45:00Z')
        }
    });
    await prisma.clinicalEvent.create({
        data: {
            patientId: patientA.id,
            encounterId: encounterA.id,
            eventType: 'MEDICATION_CHANGED',
            title: 'Medication Changed: Metoprolol Tartrate → Diltiazem Hydrochloride',
            description: 'Metoprolol 25 mg stopped due to airway reactivity. Diltiazem 30 mg TID commenced following Cardiology recommendation.',
            createdById: seniorJenkins.id,
            createdAt: new Date('2026-10-05T12:45:00Z'),
            metadata: JSON.stringify({
                oldPrescriptionId: prescription1.id,
                newPrescriptionId: prescription2.id,
                reason: 'Airway reactivity'
            })
        }
    });
    await prisma.clinicalEvent.create({
        data: {
            patientId: patientA.id,
            encounterId: encounterA.id,
            eventType: 'TREATMENT_CHANGE',
            title: 'Treatment Regimen Altered',
            description: 'Transitioned rate control from beta-blockade to calcium channel blockade.',
            createdById: seniorJenkins.id,
            createdAt: new Date('2026-10-05T12:46:00Z')
        }
    });
    // Timeline Event 11: Junior Doctor administers NEW medication (Diltiazem)
    const admin2 = await prisma.medicationAdministration.create({
        data: {
            prescriptionId: prescription2.id,
            patientId: patientA.id,
            administeredById: juniorChen.id,
            administeredAt: new Date('2026-10-05T13:00:00Z'),
            dose: '30 mg oral tablet',
            status: 'GIVEN',
            notes: 'Administered new medication Diltiazem. Patient tolerating well, chest tightness resolved.'
        }
    });
    await prisma.clinicalEvent.create({
        data: {
            patientId: patientA.id,
            encounterId: encounterA.id,
            eventType: 'MEDICATION_ADMINISTERED',
            title: 'Medication Administered: Diltiazem Hydrochloride (30 mg)',
            description: 'Administered by Dr. Alex Chen. BP 128/78, HR 88 bpm (controlled). Patient reports breathing comfortably.',
            createdById: juniorChen.id,
            createdAt: new Date('2026-10-05T13:00:00Z'),
            metadata: JSON.stringify({ administrationId: admin2.id, status: 'GIVEN' })
        }
    });
    // Seed data for other patients (B, C, D, E)
    console.log('Seeding baseline encounters and care teams for other patients...');
    // Patient B
    const encB = await prisma.encounter.create({
        data: {
            patientId: patientB.id,
            type: 'INPATIENT',
            reason: 'Exertional angina assessment and optimization',
            status: 'ACTIVE',
            startTime: new Date('2026-10-04T14:00:00Z'),
            createdById: seniorVance.id
        }
    });
    await prisma.patientAssignment.create({
        data: {
            patientId: patientB.id,
            doctorId: seniorVance.id,
            role: UserRole.SENIOR_DOCTOR,
            isPrimary: true
        }
    });
    await prisma.patientAssignment.create({
        data: {
            patientId: patientB.id,
            doctorId: juniorPatel.id,
            role: UserRole.JUNIOR_DOCTOR,
            isPrimary: false
        }
    });
    await prisma.clinicalEvent.create({
        data: {
            patientId: patientB.id,
            encounterId: encB.id,
            eventType: 'ASSESSMENT',
            title: 'Inpatient Cardiology Review: Dr. Marcus Vance',
            description: 'Patient stable on medical therapy. Ordered fasting lipid profile and liver function panel.',
            createdById: seniorVance.id,
            createdAt: new Date('2026-10-04T15:00:00Z')
        }
    });
    const rxB = await prisma.prescription.create({
        data: {
            patientId: patientB.id,
            encounterId: encB.id,
            prescribedById: seniorVance.id,
            medication: 'Atorvastatin',
            dosage: '40 mg',
            frequency: 'Once at night',
            route: 'Oral',
            duration: '30 days',
            instructions: 'Take before sleep.',
            status: 'ACTIVE'
        }
    });
    await prisma.medicationAdministration.create({
        data: {
            prescriptionId: rxB.id,
            patientId: patientB.id,
            administeredById: juniorPatel.id,
            dose: '40 mg',
            status: 'GIVEN',
            notes: 'Evening dose taken.'
        }
    });
    // Patient C (Neurology referral)
    const encC = await prisma.encounter.create({
        data: {
            patientId: patientC.id,
            type: 'CONSULTATION',
            reason: 'Frequent intractable migraines with visual scotoma',
            status: 'ACTIVE',
            startTime: new Date('2026-10-03T11:00:00Z'),
            createdById: seniorJenkins.id
        }
    });
    await prisma.specialistReferral.create({
        data: {
            patientId: patientC.id,
            encounterId: encC.id,
            referringDoctorId: seniorJenkins.id,
            specialistId: specKim.id,
            reason: 'Refractory migraine failing first-line prophylaxis. Neuro imaging clearance requested.',
            priority: 'ROUTINE',
            status: 'COMPLETED',
            recommendation: 'MRI brain unremarkable for structural pathology. Commenced on Topiramate 25 mg daily titration.',
            recommendationAt: new Date('2026-10-04T16:00:00Z')
        }
    });
    // Create some audit entries
    await prisma.auditLog.createMany({
        data: [
            {
                userId: juniorChen.id,
                patientId: patientA.id,
                action: 'ASSESSMENT_RECORDED',
                entity: 'ClinicalEvent',
                details: 'Initial vitals and observation recorded'
            },
            {
                userId: seniorJenkins.id,
                patientId: patientA.id,
                action: 'PRESCRIPTION_CREATED',
                entity: 'Prescription',
                details: 'Prescribed Metoprolol Tartrate 25 mg'
            },
            {
                userId: juniorChen.id,
                patientId: patientA.id,
                action: 'MEDICATION_ADMINISTERED',
                entity: 'MedicationAdministration',
                details: 'Metoprolol 25 mg given'
            },
            {
                userId: specRostova.id,
                patientId: patientA.id,
                action: 'SPECIALIST_RECOMMENDATION_ADDED',
                entity: 'SpecialistReferral',
                details: 'Recommended Diltiazem switch'
            },
            {
                userId: seniorJenkins.id,
                patientId: patientA.id,
                action: 'PRESCRIPTION_CHANGED',
                entity: 'Prescription',
                details: 'Metoprolol changed to Diltiazem'
            }
        ]
    });
    // Create notifications
    await prisma.notification.createMany({
        data: [
            {
                userId: specRostova.id,
                patientId: patientA.id,
                type: 'SPECIALIST_REFERRAL',
                title: 'New Specialist Referral for Eleanor Vance',
                message: 'Dr. Sarah Jenkins requested urgent cardiology opinion.',
                isRead: true
            },
            {
                userId: seniorJenkins.id,
                patientId: patientA.id,
                type: 'SPECIALIST_RECOMMENDATION',
                title: 'Specialist Recommendation for Eleanor Vance',
                message: 'Dr. Elena Rostova posted cardiology assessment.',
                isRead: false
            },
            {
                userId: juniorChen.id,
                patientId: patientA.id,
                type: 'MEDICATION_CHANGED',
                title: 'Medication Changed for Eleanor Vance',
                message: 'Switched to Diltiazem 30 mg TID.',
                isRead: false
            }
        ]
    });
    console.log('--- Clinical Seed Data successfully populated! ---');
}
main()
    .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map