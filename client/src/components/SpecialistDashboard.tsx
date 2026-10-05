import React from 'react';
import { Patient, User, SpecialistReferral } from '../types';

interface SpecialistDashboardProps {
  currentUser: User;
  patients: Patient[];
  onOpenPatientRecord: (patientId: string) => void;
  onRespondReferral: (patientId: string, referral: SpecialistReferral) => void;
}

export const SpecialistDashboard: React.FC<SpecialistDashboardProps> = ({
  currentUser,
  patients,
  onOpenPatientRecord,
  onRespondReferral
}) => {
  // 1. Gather all referrals matching current specialist or specialty
  const allReferrals: Array<{ referral: SpecialistReferral; patient: Patient }> = [];
  patients.forEach((patient) => {
    (patient.specialistReferrals || []).forEach((ref) => {
      if (
        ref.specialistId === currentUser.id ||
        (ref.specialist && ref.specialist.id === currentUser.id) ||
        ref.status === 'PENDING'
      ) {
        allReferrals.push({ referral: ref, patient });
      }
    });
  });

  // 1. New Referrals (status PENDING without recommendation)
  const newReferrals = allReferrals.filter(
    (item) => item.referral.status === 'PENDING' && !item.referral.recommendation
  );

  // 2. Pending Consultations (active cases under review)
  const referredPatientIds = new Set(allReferrals.map((r) => r.patient.id));
  const activeConsultPatients = patients.filter(
    (p) =>
      referredPatientIds.has(p.id) ||
      p.patientAssignments?.some((a) => a.active && a.doctor.id === currentUser.id)
  );

  // 3. Results to Review (diagnostic results for referred cohort)
  const resultsToReview: Array<{
    patient: Patient;
    investigation: any;
    result: any;
  }> = [];

  activeConsultPatients.forEach((patient) => {
    (patient.investigations || []).forEach((inv) => {
      if (inv.results && inv.results.length > 0) {
        resultsToReview.push({
          patient,
          investigation: inv,
          result: inv.results[inv.results.length - 1]
        });
      }
    });
  });

  // 4. Follow-ups (completed consultations with recommendations filed)
  const followUps = allReferrals.filter(
    (item) => item.referral.status === 'COMPLETED' || !!item.referral.recommendation
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Grid: 1. NEW REFERRALS & 2. PENDING CONSULTATIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1rem' }}>
        {/* 1. NEW REFERRALS */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
          <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
              NEW REFERRALS ({newReferrals.length})
            </span>
          </div>

          {newReferrals.length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
              No pending referrals.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {newReferrals.map(({ referral, patient }) => (
                <div
                  key={referral.id}
                  style={{
                    padding: '0.75rem 0.85rem',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.825rem', color: '#0f172a' }}>{patient.name}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.4rem' }}>
                        {patient.age} · {patient.gender} · {patient.mrn}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: '3px', background: referral.priority === 'STAT' ? '#fee2e2' : '#fef3c7', color: referral.priority === 'STAT' ? '#dc2626' : '#d97706' }}>
                      {referral.priority}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.775rem', color: '#334155', margin: '0.35rem 0' }}>
                    {referral.reason}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <button
                      className="btn-switch"
                      style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                      onClick={() => onOpenPatientRecord(patient.id)}
                    >
                      Record
                    </button>
                    <button
                      className="btn-switch active"
                      style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                      onClick={() => onRespondReferral(patient.id, referral)}
                    >
                      Respond
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. PENDING CONSULTATIONS */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
          <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
              PENDING CONSULTATIONS ({activeConsultPatients.length})
            </span>
          </div>

          {activeConsultPatients.length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
              No active inpatient consultations.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {activeConsultPatients.map((patient) => {
                const activeRx = (patient.prescriptions || []).filter((r) => r.status === 'ACTIVE');
                return (
                  <div
                    key={patient.id}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => onOpenPatientRecord(patient.id)}
                  >
                    <div>
                      <div>
                        <strong style={{ fontSize: '0.825rem', color: '#0f172a' }}>{patient.name}</strong>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.4rem' }}>
                          {patient.age} · {patient.gender} · {patient.mrn}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.15rem' }}>
                        Active Meds: {activeRx.map((r) => r.medication).join(', ') || 'None'}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>Record →</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Grid: 3. RESULTS TO REVIEW & 4. FOLLOW-UPS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1rem' }}>
        {/* 3. RESULTS TO REVIEW */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
          <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
              RESULTS TO REVIEW ({resultsToReview.length})
            </span>
          </div>

          {resultsToReview.length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
              No investigation results to review.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '300px', overflowY: 'auto' }}>
              {resultsToReview.map(({ patient, investigation, result }) => (
                <div
                  key={result.id}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => onOpenPatientRecord(patient.id)}
                >
                  <div>
                    <div>
                      <strong style={{ fontSize: '0.825rem', color: '#0f172a' }}>{patient.name}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#0369a1', marginLeft: '0.4rem', fontWeight: 600 }}>
                        {investigation.title}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '0.15rem' }}>
                      {result.findings}{result.values ? ` · ${result.values}` : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>Review →</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. FOLLOW-UPS */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
          <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
              FOLLOW-UPS ({followUps.length})
            </span>
          </div>

          {followUps.length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
              No completed consultations.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '300px', overflowY: 'auto' }}>
              {followUps.map(({ referral, patient }) => (
                <div
                  key={referral.id}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => onOpenPatientRecord(patient.id)}
                >
                  <div>
                    <strong style={{ fontSize: '0.825rem', color: '#0f172a' }}>{patient.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '0.15rem' }}>
                      {referral.recommendation}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>Record →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
