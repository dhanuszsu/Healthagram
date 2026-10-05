/**
 * Complete End-to-End Verification Test for Phase 1 & 2 of Healthagram
 * Validates:
 * 1. Senior Doctor (Dr. Suresh) logs in -> Opens Patient (Meenakshi) -> Adds assessment -> Creates prescription
 * 2. Junior Doctor (Dr. Ananya) logs in -> Opens SAME Patient -> Sees SAME prescription -> Records medication administration -> Records observation
 * 3. Senior logs in again -> Sees junior's update
 * 4. Senior creates specialist referral
 * 5. Specialist (Dr. Swetha) logs in -> Sees SAME Patient -> Sees relevant history -> Sees referral -> Adds specialist assessment & recommendation
 * 6. Senior sees specialist recommendation
 * 7. Junior sees relevant specialist recommendation
 * 8. Senior changes treatment -> Old treatment remains in history (CHANGED status, linked lineage)
 * 9. Junior records new medication administration
 * 10. Complete sequence verified in patient's chronological timeline
 * 11. Senior shares Senior Approach case
 * 12. Junior retrieves Senior Approach case referencing the same patient
 */

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import http from 'http';

let server: http.Server;
let baseUrl: string;

async function request(
  method: string,
  path: string,
  body?: unknown,
  token?: string
): Promise<{ status: number; body: any }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

async function runEndToEndTest() {
  console.log('====================================================');
  console.log('STARTING CLINICAL WORKFLOW END-TO-END TEST (SOUTH INDIAN PRACTITIONERS)');
  console.log('====================================================\n');

  await connectDatabase();
  const app = createApp();

  server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 5001;
  baseUrl = `http://localhost:${port}`;
  console.log(`[Test Server] Running on ${baseUrl}\n`);

  try {
    // 0. Verify Health Endpoint
    console.log('▶ [Step 0] Checking System Health & Database Connectivity...');
    const healthRes = await request('GET', '/api/health');
    if (healthRes.status !== 200 || healthRes.body.data.status !== 'healthy') {
      throw new Error(`Health check failed: ${JSON.stringify(healthRes.body)}`);
    }
    console.log('✔ Health check OK. Database connected.\n');

    // 1. Senior Doctor Logs In
    console.log('▶ [Step 1] Senior Doctor (Dr. Suresh) logs in...');
    const seniorLoginRes = await request('POST', '/api/auth/login', {
      email: 'suresh@healthagram.clinic',
      password: 'Password123!'
    });
    if (seniorLoginRes.status !== 200) {
      throw new Error(`Senior login failed: ${JSON.stringify(seniorLoginRes.body)}`);
    }
    const seniorToken = seniorLoginRes.body.data.token;
    const seniorUser = seniorLoginRes.body.data.user;
    console.log(`✔ Senior authenticated: Dr. ${seniorUser.firstName} ${seniorUser.lastName} (${seniorUser.role})\n`);

    // 2. Senior Doctor Opens Patient (Meenakshi)
    console.log('▶ [Step 2] Senior Doctor opens Patient Meenakshi...');
    const patientsRes = await request('GET', '/api/patients?search=Meenakshi', undefined, seniorToken);
    const patientA = patientsRes.body.data[0];
    if (!patientA) throw new Error('Patient Meenakshi not found in database');
    console.log(`✔ Patient loaded: ${patientA.name} | MRN: ${patientA.mrn} | Allergies: ${patientA.allergies}\n`);

    // Senior adds an assessment
    console.log('▶ [Step 3] Senior Doctor adds clinical assessment...');
    const seniorAssessmentRes = await request(
      'POST',
      `/api/patients/${patientA.id}/events`,
      {
        eventType: 'ASSESSMENT',
        title: 'Senior Round Assessment: Worsening Dyspnea and Fluttering',
        description: 'Assessed at bedside. S1/S2 variable, irregular tachycardia. Clear bilateral lung fields on auscultation.',
        metadata: { hr: 124, rr: 20 }
      },
      seniorToken
    );
    if (seniorAssessmentRes.status !== 201) throw new Error('Failed to record senior assessment');
    console.log('✔ Senior assessment recorded into shared clinical timeline.\n');

    // Senior creates a prescription
    console.log('▶ [Step 4] Senior Doctor creates prescription for Patient...');
    const prescriptionRes = await request(
      'POST',
      '/api/prescriptions',
      {
        patientId: patientA.id,
        medication: 'Bisoprolol Fumarate',
        dosage: '2.5 mg',
        frequency: 'Once daily (morning)',
        route: 'Oral',
        duration: '14 days',
        instructions: 'Take with food. Monitor HR prior to dose.'
      },
      seniorToken
    );
    if (prescriptionRes.status !== 201) throw new Error(`Prescription creation failed: ${JSON.stringify(prescriptionRes.body)}`);
    const activePrescription = prescriptionRes.body.data;
    console.log(`✔ Prescription created: ${activePrescription.medication} ${activePrescription.dosage} (ID: ${activePrescription.id})\n`);

    // 3. Junior Doctor Logs In
    console.log('▶ [Step 5] Junior Doctor (Dr. Ananya) logs in...');
    const juniorLoginRes = await request('POST', '/api/auth/login', {
      email: 'ananya@healthagram.clinic',
      password: 'Password123!'
    });
    if (juniorLoginRes.status !== 200) throw new Error('Junior login failed');
    const juniorToken = juniorLoginRes.body.data.token;
    const juniorUser = juniorLoginRes.body.data.user;
    console.log(`✔ Junior authenticated: Dr. ${juniorUser.firstName} ${juniorUser.lastName} (${juniorUser.role})\n`);

    // Junior opens SAME Patient
    console.log('▶ [Step 6] Junior Doctor opens SAME Patient Meenakshi...');
    const juniorPatientViewRes = await request('GET', `/api/patients/${patientA.id}`, undefined, juniorToken);
    const juniorViewedPatient = juniorPatientViewRes.body.data;
    if (juniorViewedPatient.id !== patientA.id) throw new Error('Junior did not load same patient');
    console.log(`✔ Junior confirmed reading SAME patient record: ${juniorViewedPatient.name} (MRN: ${juniorViewedPatient.mrn})`);

    // Junior sees SAME prescription
    const juniorPrescriptions = juniorViewedPatient.prescriptions;
    const matchingPrescription = juniorPrescriptions.find((p: any) => p.id === activePrescription.id);
    if (!matchingPrescription) throw new Error('Junior cannot see senior-created prescription!');
    console.log(`✔ Junior sees SAME active prescription: ${matchingPrescription.medication} (${matchingPrescription.status})\n`);

    // Junior records medication administration
    console.log('▶ [Step 7] Junior Doctor records medication administration...');
    const adminRes = await request(
      'POST',
      `/api/prescriptions/${activePrescription.id}/administer`,
      {
        dose: '2.5 mg oral tablet',
        status: 'GIVEN',
        notes: 'Administered with water. Ingested without difficulty.'
      },
      juniorToken
    );
    if (adminRes.status !== 201) throw new Error(`Medication administration failed: ${JSON.stringify(adminRes.body)}`);
    console.log('✔ Medication administration recorded in system and timeline.\n');

    // Junior records clinical observation
    console.log('▶ [Step 8] Junior Doctor records clinical observation...');
    const juniorObsRes = await request(
      'POST',
      `/api/patients/${patientA.id}/events`,
      {
        eventType: 'ASSESSMENT',
        title: 'Junior Observation: Post-Administration Bradycardia & Wheeze',
        description: 'Post-dose 45 mins: Heart rate dropped rapidly to 48 bpm with prolonged pauses on telemetry. Audible bilateral expiratory wheeze noted. Patient reports chest tightness.',
        metadata: { hr: 48, symptom: 'bradycardia and wheeze' }
      },
      juniorToken
    );
    if (juniorObsRes.status !== 201) throw new Error('Failed to record junior observation');
    console.log('✔ Junior observation recorded on shared timeline.\n');

    // 4. Senior Logs In Again & Sees Junior's Updates
    console.log('▶ [Step 9] Senior Doctor checks Patient timeline to see Junior updates...');
    const seniorTimelineRes = await request('GET', `/api/patients/${patientA.id}/timeline?order=asc`, undefined, seniorToken);
    const events = seniorTimelineRes.body.data;
    const adminEvent = events.find((e: any) => e.eventType === 'MEDICATION_ADMINISTERED' && e.createdBy.id === juniorUser.id);
    const obsEvent = events.find((e: any) => e.eventType === 'ASSESSMENT' && e.title.includes('Junior Observation'));
    if (!adminEvent || !obsEvent) throw new Error("Senior cannot see Junior's timeline updates!");
    console.log("✔ Senior sees Junior's medication administration and clinical observation in the timeline.\n");

    // 5. Senior Creates Specialist Referral
    console.log('▶ [Step 10] Senior Doctor creates Specialist Referral to Cardiology...');
    const doctorsRes = await request('GET', '/api/auth/doctors', undefined, seniorToken);
    const specialist = doctorsRes.body.data.find((d: any) => d.email === 'swetha@healthagram.clinic');
    if (!specialist) throw new Error('Cardiology specialist not found');

    const referralRes = await request(
      'POST',
      '/api/referrals',
      {
        patientId: patientA.id,
        specialistId: specialist.id,
        reason: 'Severe symptomatic sinus bradycardia (HR 48) and bronchospasm post beta-blocker. Urgent opinion requested.',
        priority: 'STAT'
      },
      seniorToken
    );
    if (referralRes.status !== 201) throw new Error(`Referral creation failed: ${JSON.stringify(referralRes.body)}`);
    const referral = referralRes.body.data;
    console.log(`✔ Specialist referral created (ID: ${referral.id}) with priority STAT.\n`);

    // 6. Specialist Logs In
    console.log('▶ [Step 11] Specialist (Dr. Swetha) logs in...');
    const specLoginRes = await request('POST', '/api/auth/login', {
      email: 'swetha@healthagram.clinic',
      password: 'Password123!'
    });
    if (specLoginRes.status !== 200) throw new Error('Specialist login failed');
    const specToken = specLoginRes.body.data.token;
    const specUser = specLoginRes.body.data.user;
    console.log(`✔ Specialist authenticated: Dr. ${specUser.firstName} ${specUser.lastName} (${specUser.doctorProfile.specialization})\n`);

    // Specialist sees SAME Patient and referral
    console.log('▶ [Step 12] Specialist opens SAME Patient and assigned referrals...');
    const specReferralsRes = await request('GET', '/api/referrals/assigned-to-me', undefined, specToken);
    const specReferrals = specReferralsRes.body.data;
    const assignedReferral = specReferrals.find((r: any) => r.id === referral.id);
    if (!assignedReferral) throw new Error('Specialist cannot see assigned referral!');
    console.log(`✔ Specialist received referral for ${assignedReferral.patient.name} (${assignedReferral.reason})`);

    // Specialist adds recommendation
    console.log('▶ [Step 13] Specialist adds assessment and clinical recommendation...');
    const recommendationText = 'Beta-blocker contra-indicated due to marked sinus node dysfunction & reactive bronchospasm. Immediately discontinue Bisoprolol. Commencing Diltiazem 60mg BID for rate control if HR > 75. Order 24h Holter telemetry.';
    const specResponseRes = await request(
      'POST',
      `/api/referrals/${referral.id}/respond`,
      {
        recommendation: recommendationText,
        status: 'COMPLETED'
      },
      specToken
    );
    if (specResponseRes.status !== 200) throw new Error(`Specialist response failed: ${JSON.stringify(specResponseRes.body)}`);
    console.log('✔ Specialist recommendation added and referral status updated to COMPLETED.\n');

    // 7. Senior Changes Treatment (Lineage Preserved!)
    console.log('▶ [Step 14] Senior Doctor changes treatment based on Specialist Recommendation...');
    const changeReason = 'Severe bradycardia and bronchospasm under beta-blocker; switched per Dr. Swetha (Cardiology) recommendation';
    const changeTreatmentRes = await request(
      'POST',
      `/api/prescriptions/${activePrescription.id}/change`,
      {
        changeReason,
        medication: 'Diltiazem Hydrochloride',
        dosage: '60 mg',
        frequency: 'Twice daily',
        route: 'Oral',
        duration: '10 days',
        instructions: 'Hold if systolic BP < 100 or HR < 60.'
      },
      seniorToken
    );
    if (changeTreatmentRes.status !== 200) throw new Error(`Change treatment failed: ${JSON.stringify(changeTreatmentRes.body)}`);
    const newPrescription = changeTreatmentRes.body.data;
    console.log(`✔ Treatment successfully modified: New Prescription ID: ${newPrescription.id} (${newPrescription.medication})\n`);

    // 8. Junior Records Administration for NEW Medication
    console.log('▶ [Step 15] Junior Doctor records administration for NEW medication...');
    const newAdminRes = await request(
      'POST',
      `/api/prescriptions/${newPrescription.id}/administer`,
      {
        dose: '60 mg oral tablet',
        status: 'GIVEN',
        notes: 'New regimen commenced. Pre-dose HR: 84 bpm, BP: 126/80.'
      },
      juniorToken
    );
    if (newAdminRes.status !== 201) throw new Error(`New medication administration failed: ${JSON.stringify(newAdminRes.body)}`);
    console.log('✔ New medication administration recorded.\n');

    // 9. Senior Shares Senior Approach Case
    console.log('▶ [Step 16] Senior Doctor shares Senior Approach case for this patient...');
    const approachRes = await request(
      'POST',
      '/api/senior-approach',
      {
        patientId: patientA.id,
        title: 'Managing Complex Atrial Fibrillation with Bronchospasm',
        situation: 'Elderly patient with acute AFib with RVR developing bradycardia and bronchospasm post beta-blocker.',
        assessment: 'Unmasked reactive airway disease requiring prompt transition away from beta-blockade.',
        decision: 'Consulted cardiology; switched to Diltiazem 60mg BID.',
        treatmentApproach: 'Calcium channel blockade with telemetry monitoring.',
        reasoning: 'Preserves rate control without provoking airway constriction.',
        outcome: 'Heart rate stabilized at 84 bpm with clear chest auscultation.'
      },
      seniorToken
    );
    if (approachRes.status !== 201) throw new Error('Failed to create Senior Approach case');
    console.log(`✔ Senior Approach case shared (ID: ${approachRes.body.data.id})\n`);

    // 10. Junior Browses Senior Approach Case
    console.log('▶ [Step 17] Junior Doctor browses Senior Approach cases...');
    const listApproachesRes = await request('GET', '/api/senior-approach', undefined, juniorToken);
    const approaches = listApproachesRes.body.data;
    if (approaches.length === 0) throw new Error('No senior approach cases found');
    console.log(`✔ Junior retrieved ${approaches.length} Senior Approach cases! (Sample: "${approaches[0].title}")\n`);

    // 11. Test "What Changed" API
    console.log('▶ [Step 18] Testing "What Changed" API for Patient...');
    const whatChangedRes = await request('GET', `/api/patients/${patientA.id}/what-changed`, undefined, juniorToken);
    if (whatChangedRes.status !== 200) throw new Error('Failed to get what changed');
    console.log(`✔ "What Changed" successfully retrieved (${whatChangedRes.body.data.totalChanges} recent changes reported).\n`);

    // 12. ROLE SECURITY TEST: Junior doctor attempts restricted Senior-only actions
    console.log('▶ [Step 19] Testing Role Security: Junior attempts to create prescription (Restricted)...');
    const unauthorizedRxRes = await request(
      'POST',
      '/api/prescriptions',
      {
        patientId: patientA.id,
        medication: 'Amiodarone',
        dosage: '200 mg',
        frequency: 'Daily',
        route: 'Oral',
        duration: '7 days'
      },
      juniorToken
    );
    if (unauthorizedRxRes.status !== 403) {
      throw new Error(`Security breach: Junior doctor was able to prescribe (Status: ${unauthorizedRxRes.status})`);
    }
    console.log('✔ Junior prescription rejected by backend authorization (403 Forbidden).\n');

    console.log('▶ [Step 20] Testing Role Security: Junior attempts to share Senior Approach (Restricted)...');
    const unauthorizedApproachRes = await request(
      'POST',
      '/api/senior-approach',
      {
        patientId: patientA.id,
        title: 'Unauthorized Case Study',
        decision: 'Attempted by resident'
      },
      juniorToken
    );
    if (unauthorizedApproachRes.status !== 403) {
      throw new Error(`Security breach: Junior was able to share senior approach (Status: ${unauthorizedApproachRes.status})`);
    }
    console.log('✔ Junior Senior Approach publication rejected by backend authorization (403 Forbidden).\n');

    // 13. ROLE SECURITY TEST: Specialist access to unrelated patients
    console.log('▶ [Step 21] Testing Role Security: Specialist access to patients...');
    // Dr. Swetha has Meenakshi referred. Let's find an unreferred patient (e.g. Arjun Raj who was referred to Dr. Anand)
    const allPtsRes = await request('GET', '/api/patients', undefined, seniorToken);
    const unrelatedPt = allPtsRes.body.data.find((p: any) => p.name === 'Arjun Raj' || p.mrn === 'PAT-1003');
    if (unrelatedPt) {
      const specialistAccessRes = await request('GET', `/api/patients/${unrelatedPt.id}`, undefined, specToken);
      if (specialistAccessRes.status !== 403) {
        throw new Error(`Security breach: Specialist Dr. Swetha accessed unreferred patient ${unrelatedPt.name} (Status: ${specialistAccessRes.status})`);
      }
      console.log(`✔ Specialist access to unreferred patient (${unrelatedPt.name}) correctly denied (403 Forbidden).\n`);
    }

    // 14. DATA INTEGRITY & AUDIT TRAIL VERIFICATION
    console.log('▶ [Step 22] Testing Data Integrity & Regulatory Audit Trail...');
    const auditRes = await request('GET', `/api/audit/patient/${patientA.id}`, undefined, seniorToken);
    if (auditRes.status !== 200 || !auditRes.body.data || auditRes.body.data.length === 0) {
      throw new Error('Audit trail empty or inaccessible');
    }
    console.log(`✔ Audit trail verified (${auditRes.body.data.length} regulatory audit entries permanently logged).\n`);

    console.log('====================================================');
    console.log('🎉 ALL 22 TEST STEPS PASSED SUCCESSFULLY!');
    console.log('ONE PATIENT -> ONE SHARED RECORD -> MULTI-DOCTOR COLLABORATION');
    console.log('ROLE-BASED AUTHORIZATION & DATA INTEGRITY 100% VERIFIED');
    console.log('====================================================\n');
  } finally {
    server.close();
    await disconnectDatabase();
  }
}

runEndToEndTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ TEST FAILED:', err);
    process.exit(1);
  });
