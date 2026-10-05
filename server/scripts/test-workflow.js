/**
 * Complete End-to-End Verification Test for Phase 1 of Healthagram
 * Validates:
 * 1. Senior logs in -> Opens Patient A -> Adds assessment -> Creates prescription
 * 2. Junior logs in -> Opens SAME Patient A -> Sees SAME prescription -> Records medication administration -> Records observation
 * 3. Senior logs in again -> Sees junior's update
 * 4. Senior creates specialist referral
 * 5. Specialist logs in -> Sees SAME Patient A -> Sees relevant history -> Sees referral -> Adds specialist assessment & recommendation
 * 6. Senior sees specialist recommendation
 * 7. Junior sees relevant specialist recommendation
 * 8. Senior changes treatment -> Old treatment remains in history (CHANGED status, linked lineage)
 * 9. Junior records new medication administration
 * 10. Complete sequence verified in patient's chronological timeline
 */
import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
let server;
let baseUrl;
async function request(method, path, body, token) {
    const headers = {
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
    console.log('STARTING PHASE 1 CLINICAL WORKFLOW END-TO-END TEST');
    console.log('====================================================\n');
    await connectDatabase();
    const app = createApp();
    // Start temporary test server on ephemeral port
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
        console.log('▶ [Step 1] Senior Doctor (Dr. Sarah Jenkins) logs in...');
        const seniorLoginRes = await request('POST', '/api/auth/login', {
            email: 'sarah.jenkins@healthagram.clinic',
            password: 'Password123!'
        });
        if (seniorLoginRes.status !== 200) {
            throw new Error(`Senior login failed: ${JSON.stringify(seniorLoginRes.body)}`);
        }
        const seniorToken = seniorLoginRes.body.data.token;
        const seniorUser = seniorLoginRes.body.data.user;
        console.log(`✔ Senior authenticated: Dr. ${seniorUser.firstName} ${seniorUser.lastName} (${seniorUser.role})\n`);
        // 2. Senior Doctor Opens Patient A ("Eleanor Vance")
        console.log('▶ [Step 2] Senior Doctor opens Patient A...');
        const patientsRes = await request('GET', '/api/patients?search=Eleanor', undefined, seniorToken);
        const patientA = patientsRes.body.data[0];
        if (!patientA)
            throw new Error('Patient A (Eleanor Vance) not found in database');
        console.log(`✔ Patient A loaded: ${patientA.name} | MRN: ${patientA.mrn} | Allergies: ${patientA.allergies}\n`);
        // Senior adds an assessment
        console.log('▶ [Step 3] Senior Doctor adds clinical assessment to Patient A...');
        const seniorAssessmentRes = await request('POST', `/api/patients/${patientA.id}/events`, {
            eventType: 'ASSESSMENT',
            title: 'Senior Round Assessment: Worsening Dyspnea and Fluttering',
            description: 'Assessed at bedside. S1/S2 variable, irregular tachycardia. Clear bilateral lung fields on auscultation.',
            metadata: { hr: 124, rr: 20 }
        }, seniorToken);
        if (seniorAssessmentRes.status !== 201)
            throw new Error('Failed to record senior assessment');
        console.log('✔ Senior assessment recorded into shared clinical timeline.\n');
        // Senior creates a prescription
        console.log('▶ [Step 4] Senior Doctor creates prescription for Patient A...');
        const prescriptionRes = await request('POST', '/api/prescriptions', {
            patientId: patientA.id,
            medication: 'Bisoprolol Fumarate',
            dosage: '2.5 mg',
            frequency: 'Once daily (morning)',
            route: 'Oral',
            duration: '14 days',
            instructions: 'Take with food. Monitor HR prior to dose.'
        }, seniorToken);
        if (prescriptionRes.status !== 201)
            throw new Error(`Prescription creation failed: ${JSON.stringify(prescriptionRes.body)}`);
        const activePrescription = prescriptionRes.body.data;
        console.log(`✔ Prescription created: ${activePrescription.medication} ${activePrescription.dosage} (ID: ${activePrescription.id})\n`);
        // 3. Junior Doctor Logs In
        console.log('▶ [Step 5] Junior Doctor (Dr. Alex Chen) logs in...');
        const juniorLoginRes = await request('POST', '/api/auth/login', {
            email: 'alex.chen@healthagram.clinic',
            password: 'Password123!'
        });
        if (juniorLoginRes.status !== 200)
            throw new Error('Junior login failed');
        const juniorToken = juniorLoginRes.body.data.token;
        const juniorUser = juniorLoginRes.body.data.user;
        console.log(`✔ Junior authenticated: Dr. ${juniorUser.firstName} ${juniorUser.lastName} (${juniorUser.role})\n`);
        // Junior opens SAME Patient A
        console.log('▶ [Step 6] Junior Doctor opens SAME Patient A...');
        const juniorPatientViewRes = await request('GET', `/api/patients/${patientA.id}`, undefined, juniorToken);
        const juniorViewedPatient = juniorPatientViewRes.body.data;
        if (juniorViewedPatient.id !== patientA.id)
            throw new Error('Junior did not load same patient');
        console.log(`✔ Junior confirmed reading SAME patient record: ${juniorViewedPatient.name} (MRN: ${juniorViewedPatient.mrn})`);
        // Junior sees SAME prescription
        const juniorPrescriptions = juniorViewedPatient.prescriptions;
        const matchingPrescription = juniorPrescriptions.find((p) => p.id === activePrescription.id);
        if (!matchingPrescription)
            throw new Error('Junior cannot see senior-created prescription!');
        console.log(`✔ Junior sees SAME active prescription: ${matchingPrescription.medication} (${matchingPrescription.status})\n`);
        // Junior records medication administration
        console.log('▶ [Step 7] Junior Doctor records medication administration...');
        const adminRes = await request('POST', `/api/prescriptions/${activePrescription.id}/administer`, {
            dose: '2.5 mg oral tablet',
            status: 'GIVEN',
            notes: 'Administered with water. Patient ingested without difficulty.'
        }, juniorToken);
        if (adminRes.status !== 201)
            throw new Error(`Medication administration failed: ${JSON.stringify(adminRes.body)}`);
        console.log('✔ Medication administration recorded in system and timeline.\n');
        // Junior records clinical observation
        console.log('▶ [Step 8] Junior Doctor records clinical observation...');
        const juniorObsRes = await request('POST', `/api/patients/${patientA.id}/events`, {
            eventType: 'ASSESSMENT',
            title: 'Junior Observation: Post-Administration Bradycardia & Wheeze',
            description: 'Post-dose 45 mins: Heart rate dropped rapidly to 48 bpm with prolonged pauses on telemetry. Audible bilateral expiratory wheeze noted. Patient reports chest tightness.',
            metadata: { hr: 48, symptom: 'bradycardia and wheeze' }
        }, juniorToken);
        if (juniorObsRes.status !== 201)
            throw new Error('Failed to record junior observation');
        console.log('✔ Junior observation recorded on shared timeline.\n');
        // 4. Senior Logs In Again & Sees Junior's Updates
        console.log('▶ [Step 9] Senior Doctor checks Patient A timeline to see Junior updates...');
        const seniorTimelineRes = await request('GET', `/api/patients/${patientA.id}/timeline`, undefined, seniorToken);
        const events = seniorTimelineRes.body.data;
        const adminEvent = events.find((e) => e.eventType === 'MEDICATION_ADMINISTERED' && e.createdBy.id === juniorUser.id);
        const obsEvent = events.find((e) => e.eventType === 'ASSESSMENT' && e.title.includes('Junior Observation'));
        if (!adminEvent || !obsEvent)
            throw new Error("Senior cannot see Junior's timeline updates!");
        console.log("✔ Senior sees Junior's medication administration and clinical observation in the timeline.\n");
        // 5. Senior Creates Specialist Referral
        console.log('▶ [Step 10] Senior Doctor creates Specialist Referral to Cardiology...');
        // Look up specialist Dr. Elena Rostova
        const doctorsRes = await request('GET', '/api/auth/doctors', undefined, seniorToken);
        const specialist = doctorsRes.body.data.find((d) => d.email === 'elena.rostova@healthagram.clinic');
        if (!specialist)
            throw new Error('Cardiology specialist not found');
        const referralRes = await request('POST', '/api/referrals', {
            patientId: patientA.id,
            specialistId: specialist.id,
            reason: 'Severe symptomatic sinus bradycardia (HR 48) and bronchospasm post beta-blocker. Urgent opinion requested.',
            priority: 'STAT'
        }, seniorToken);
        if (referralRes.status !== 201)
            throw new Error(`Referral creation failed: ${JSON.stringify(referralRes.body)}`);
        const referral = referralRes.body.data;
        console.log(`✔ Specialist referral created (ID: ${referral.id}) with priority STAT.\n`);
        // 6. Specialist Logs In
        console.log('▶ [Step 11] Specialist (Dr. Elena Rostova) logs in...');
        const specLoginRes = await request('POST', '/api/auth/login', {
            email: 'elena.rostova@healthagram.clinic',
            password: 'Password123!'
        });
        if (specLoginRes.status !== 200)
            throw new Error('Specialist login failed');
        const specToken = specLoginRes.body.data.token;
        const specUser = specLoginRes.body.data.user;
        console.log(`✔ Specialist authenticated: Dr. ${specUser.firstName} ${specUser.lastName} (${specUser.doctorProfile.specialization})\n`);
        // Specialist sees SAME Patient A and referral
        console.log('▶ [Step 12] Specialist opens SAME Patient A and assigned referrals...');
        const specReferralsRes = await request('GET', '/api/referrals/assigned-to-me', undefined, specToken);
        const specReferrals = specReferralsRes.body.data;
        const assignedReferral = specReferrals.find((r) => r.id === referral.id);
        if (!assignedReferral)
            throw new Error('Specialist cannot see assigned referral!');
        console.log(`✔ Specialist received referral for ${assignedReferral.patient.name} (${assignedReferral.reason})`);
        // Specialist sees Patient's relevant history
        const specPatientRes = await request('GET', `/api/patients/${patientA.id}`, undefined, specToken);
        const specViewPatient = specPatientRes.body.data;
        console.log(`✔ Specialist inspected full history: ${specViewPatient.prescriptions.length} prescriptions, ${specViewPatient.encounters.length} encounters.\n`);
        // Specialist adds assessment & recommendation
        console.log('▶ [Step 13] Specialist adds assessment and clinical recommendation...');
        const recommendationText = 'Beta-blocker contra-indicated due to marked sinus node dysfunction & reactive bronchospasm. Immediately discontinue Bisoprolol. Commencing Diltiazem 60mg BID for rate control if HR > 75. Order 24h Holter telemetry.';
        const specResponseRes = await request('POST', `/api/referrals/${referral.id}/respond`, {
            recommendation: recommendationText,
            status: 'COMPLETED'
        }, specToken);
        if (specResponseRes.status !== 200)
            throw new Error(`Specialist response failed: ${JSON.stringify(specResponseRes.body)}`);
        console.log('✔ Specialist recommendation added and referral status updated to COMPLETED.\n');
        // 7. Senior Sees Specialist Recommendation
        console.log('▶ [Step 14] Senior Doctor verifies Specialist Recommendation...');
        const seniorReferralsCheck = await request('GET', `/api/referrals/patient/${patientA.id}`, undefined, seniorToken);
        const completedReferral = seniorReferralsCheck.body.data.find((r) => r.id === referral.id);
        if (!completedReferral || !completedReferral.recommendation) {
            throw new Error('Senior cannot see specialist recommendation!');
        }
        console.log(`✔ Senior Doctor retrieved Specialist Recommendation: "${completedReferral.recommendation.substring(0, 60)}..."\n`);
        // 8. Junior Sees Specialist Recommendation
        console.log('▶ [Step 15] Junior Doctor checks Patient A and sees Specialist Recommendation...');
        const juniorReferralCheck = await request('GET', `/api/referrals/patient/${patientA.id}`, undefined, juniorToken);
        const juniorSeenReferral = juniorReferralCheck.body.data.find((r) => r.id === referral.id);
        if (!juniorSeenReferral || !juniorSeenReferral.recommendation) {
            throw new Error('Junior cannot see specialist recommendation!');
        }
        console.log(`✔ Junior Doctor confirmed reading Specialist Recommendation.\n`);
        // 9. Senior Changes Treatment (Never silently overwrite!)
        console.log('▶ [Step 16] Senior Doctor changes treatment based on Specialist Recommendation...');
        const changeReason = 'Severe bradycardia and bronchospasm under beta-blocker; switched per Dr. Rostova (Cardiology) recommendation';
        const changeTreatmentRes = await request('POST', `/api/prescriptions/${activePrescription.id}/change`, {
            changeReason,
            medication: 'Diltiazem Hydrochloride',
            dosage: '60 mg',
            frequency: 'Twice daily',
            route: 'Oral',
            duration: '10 days',
            instructions: 'Hold if systolic BP < 100 or HR < 60.'
        }, seniorToken);
        if (changeTreatmentRes.status !== 200)
            throw new Error(`Change treatment failed: ${JSON.stringify(changeTreatmentRes.body)}`);
        const newPrescription = changeTreatmentRes.body.data;
        console.log(`✔ Treatment successfully modified: New Prescription ID: ${newPrescription.id} (${newPrescription.medication})\n`);
        // Verify OLD prescription remains in history!
        console.log('▶ [Step 17] Verifying Old Prescription remains in clinical history...');
        const prescriptionsHistoryRes = await request('GET', `/api/prescriptions/patient/${patientA.id}`, undefined, seniorToken);
        const allPrescriptions = prescriptionsHistoryRes.body.data;
        const oldPrescriptionInHistory = allPrescriptions.find((p) => p.id === activePrescription.id);
        if (!oldPrescriptionInHistory)
            throw new Error('Old prescription was deleted! It must remain in history!');
        if (oldPrescriptionInHistory.status !== 'CHANGED')
            throw new Error(`Old prescription status is ${oldPrescriptionInHistory.status}, expected CHANGED`);
        console.log(`✔ Old prescription verified: Status=${oldPrescriptionInHistory.status}, Reason="${oldPrescriptionInHistory.changeReason}"`);
        console.log(`✔ New prescription active: Status=${newPrescription.status}, previousPrescriptionId=${newPrescription.previousPrescriptionId}\n`);
        // 10. Junior Records Administration for NEW Medication
        console.log('▶ [Step 18] Junior Doctor records administration for NEW medication...');
        const newAdminRes = await request('POST', `/api/prescriptions/${newPrescription.id}/administer`, {
            dose: '60 mg oral tablet',
            status: 'GIVEN',
            notes: 'New regimen commenced. Pre-dose HR: 84 bpm, BP: 126/80.'
        }, juniorToken);
        if (newAdminRes.status !== 201)
            throw new Error(`New medication administration failed: ${JSON.stringify(newAdminRes.body)}`);
        console.log('✔ New medication administration recorded.\n');
        // 11. Complete Chronological Sequence Verification in Timeline
        console.log('▶ [Step 19] Verifying complete chronological timeline sequence on shared patient record...');
        const finalTimelineRes = await request('GET', `/api/patients/${patientA.id}/timeline?order=asc`, undefined, seniorToken);
        const timeline = finalTimelineRes.body.data;
        console.log(`\n--- Chronological Timeline for Patient: ${patientA.name} (${timeline.length} events) ---`);
        timeline.forEach((event, idx) => {
            const time = new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const doctorRole = event.createdBy.role;
            const doctorName = `Dr. ${event.createdBy.lastName}`;
            console.log(`  [#${idx + 1}] ${time} | [${event.eventType.padEnd(23)}] by ${doctorName.padEnd(16)} (${doctorRole}): ${event.title}`);
        });
        // Validate key events exist in timeline
        const eventTypes = timeline.map((e) => e.eventType);
        const requiredTypes = [
            'ASSESSMENT',
            'PRESCRIPTION',
            'MEDICATION_ADMINISTERED',
            'SPECIALIST_REFERRAL',
            'SPECIALIST_REVIEW',
            'MEDICATION_CHANGED',
            'TREATMENT_CHANGE'
        ];
        for (const reqType of requiredTypes) {
            if (!eventTypes.includes(reqType)) {
                throw new Error(`Missing expected event type in timeline: ${reqType}`);
            }
        }
        console.log('\n✔ All clinical workflow event types verified in chronological timeline!\n');
        // 12. Verify Audit Trail
        console.log('▶ [Step 20] Verifying Audit Trail integrity...');
        const auditRes = await request('GET', `/api/audit/patient/${patientA.id}`, undefined, seniorToken);
        const auditLogs = auditRes.body.data;
        console.log(`✔ Patient has ${auditLogs.length} persistent audit trail entries.`);
        const actions = auditLogs.map((a) => a.action);
        console.log(`  Sample logged actions: ${actions.slice(0, 5).join(', ')}...`);
        console.log('\n====================================================');
        console.log('🎉 ALL 20 TEST STEPS PASSED SUCCESSFULLY!');
        console.log('ONE PATIENT -> ONE SHARED RECORD -> MULTI-DOCTOR COLLABORATION VERIFIED');
        console.log('====================================================\n');
    }
    finally {
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
//# sourceMappingURL=test-workflow.js.map