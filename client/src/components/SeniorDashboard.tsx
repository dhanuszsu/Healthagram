import React from 'react';
import { Patient, User } from '../types';

interface SeniorDashboardProps {
  currentUser: User;
  patients: Patient[];
  onOpenPatientRecord: (patientId: string) => void;
  onNavigateToApproach?: () => void;
}

export const SeniorDashboard: React.FC<SeniorDashboardProps> = ({
  currentUser,
  patients,
  onOpenPatientRecord
}) => {
  // 1. Specialist Updates across patients
  const specialistUpdates: Array<{
    patient: Patient;
    referral: any;
  }> = [];

  patients.forEach((patient) => {
    (patient.specialistReferrals || []).forEach((ref) => {
      if (ref.recommendation) {
        specialistUpdates.push({ patient, referral: ref });
      }
    });
  });

  // 2. Junior Requests / Escalations
  const juniorRequests: Array<{
    patient: Patient;
    message: string;
    author: string;
  }> = [];

  patients.forEach((patient) => {
    (patient.prescriptions || []).forEach((rx) => {
      (rx.administrations || []).forEach((adm) => {
        if (adm.administeredBy?.role === 'JUNIOR_DOCTOR') {
          juniorRequests.push({
            patient,
            message: `${rx.medication} ${rx.dosage}: Dose given (${adm.dose}).`,
            author: `Dr. ${adm.administeredBy.lastName}`
          });
        }
      });
    });

    (patient.clinicalCommunications || []).forEach((comm) => {
      if (comm.sender.role === 'JUNIOR_DOCTOR') {
        juniorRequests.push({
          patient,
          message: `${comm.subject}: ${comm.content}`,
          author: `Dr. ${comm.sender.lastName}`
        });
      }
    });
  });

  // 3. New Diagnostic Results
  const newResults: Array<{
    patient: Patient;
    investigation: any;
    result: any;
  }> = [];

  patients.forEach((patient) => {
    (patient.investigations || []).forEach((inv) => {
      (inv.results || []).forEach((res) => {
        newResults.push({
          patient,
          investigation: inv,
          result: res
        });
      });
    });
  });

  // 4. Changed Conditions (patients with changed medications, acute reasons, or warnings)
  const changedConditions = patients.filter((p) => {
    const hasChangedRx = p.prescriptions?.some((rx) => rx.status === 'CHANGED' || rx.status === 'STOPPED');
    const isStatReferral = p.specialistReferrals?.some((r) => r.priority === 'STAT');
    return hasChangedRx || isStatReferral;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 1. PATIENTS NEEDING REVIEW */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
        <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
            PATIENTS NEEDING REVIEW ({patients.length})
          </span>
        </div>

        {patients.length === 0 ? (
          <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
            No patients under review.
          </div>
        ) : (
          <table className="clinical-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.5rem 0.85rem' }}>Patient</th>
                <th style={{ padding: '0.5rem 0.85rem' }}>MRN</th>
                <th style={{ padding: '0.5rem 0.85rem' }}>Condition / History</th>
                <th style={{ padding: '0.5rem 0.85rem' }}>Status</th>
                <th style={{ padding: '0.5rem 0.85rem' }}>Resident</th>
                <th style={{ padding: '0.5rem 0.85rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => {
                const activeEncounter = patient.encounters?.find((e) => e.status === 'ACTIVE') || patient.encounters?.[0];
                const resident = patient.patientAssignments?.find((a) => a.doctor.role === 'JUNIOR_DOCTOR')?.doctor;
                const hasPendingConsult = patient.specialistReferrals?.some((r) => r.recommendation && r.status !== 'COMPLETED');

                return (
                  <tr
                    key={patient.id}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    onClick={() => onOpenPatientRecord(patient.id)}
                  >
                    <td style={{ padding: '0.5rem 0.85rem' }}>
                      <strong style={{ color: '#0f172a' }}>{patient.name}</strong>
                      <span style={{ color: '#64748b', marginLeft: '0.4rem', fontSize: '0.75rem' }}>
                        {patient.age} · {patient.gender}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem 0.85rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#475569' }}>
                      {patient.mrn}
                    </td>
                    <td style={{ padding: '0.5rem 0.85rem', color: '#334155' }}>
                      {activeEncounter?.reason || patient.medicalHistory || 'Under Evaluation'}
                    </td>
                    <td style={{ padding: '0.5rem 0.85rem' }}>
                      {hasPendingConsult ? (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7c3aed', background: '#f3e8ff', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>
                          Specialist Note
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#15803d', background: '#dcfce7', padding: '0.1rem 0.4rem', borderRadius: '3px', fontWeight: 600 }}>
                          Active Inpatient
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.5rem 0.85rem', color: '#475569' }}>
                      {resident ? `Dr. ${resident.lastName}` : 'Unassigned'}
                    </td>
                    <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right' }}>
                      <button
                        className="btn-switch active"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPatientRecord(patient.id);
                        }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Grid: 2. JUNIOR REQUESTS & 3. NEW RESULTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1rem' }}>
        {/* 2. JUNIOR REQUESTS */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
          <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
              JUNIOR REQUESTS ({juniorRequests.length})
            </span>
          </div>

          {juniorRequests.length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
              No junior requests.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '300px', overflowY: 'auto' }}>
              {juniorRequests.slice(0, 5).map((req, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.6rem 0.85rem',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => onOpenPatientRecord(req.patient.id)}
                >
                  <div>
                    <div>
                      <strong style={{ fontSize: '0.825rem', color: '#0f172a' }}>{req.patient.name}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '0.4rem' }}>{req.author}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '0.15rem' }}>
                      {req.message}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>Review →</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. NEW RESULTS */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
          <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
              NEW RESULTS ({newResults.length})
            </span>
          </div>

          {newResults.length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
              No new investigation results.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '300px', overflowY: 'auto' }}>
              {newResults.slice(0, 5).map(({ patient, investigation, result }) => (
                <div
                  key={result.id}
                  style={{
                    padding: '0.6rem 0.85rem',
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
      </div>

      {/* Grid: 4. CHANGED CONDITIONS & 5. SPECIALIST UPDATES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1rem' }}>
        {/* 4. CHANGED CONDITIONS */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
          <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
              CHANGED CONDITIONS ({changedConditions.length})
            </span>
          </div>

          {changedConditions.length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
              No changed patient conditions.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {changedConditions.map((patient) => {
                const changedRx = patient.prescriptions?.find((r) => r.status === 'CHANGED');
                return (
                  <div
                    key={patient.id}
                    style={{
                      padding: '0.6rem 0.85rem',
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
                      <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.4rem' }}>{patient.mrn}</span>
                      <div style={{ fontSize: '0.75rem', color: '#9a3412', marginTop: '0.15rem' }}>
                        {changedRx ? `Medication changed: ${changedRx.medication} (${changedRx.changeReason || 'Regimen update'})` : 'Acute clinical priority change'}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>Review →</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. SPECIALIST UPDATES */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
          <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
              SPECIALIST UPDATES ({specialistUpdates.length})
            </span>
          </div>

          {specialistUpdates.length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
              No specialist updates.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '300px', overflowY: 'auto' }}>
              {specialistUpdates.map(({ patient, referral }) => (
                <div
                  key={referral.id}
                  style={{
                    padding: '0.6rem 0.85rem',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer'
                  }}
                  onClick={() => onOpenPatientRecord(patient.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.825rem', color: '#0f172a' }}>{patient.name}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.4rem' }}>
                        Dr. {referral.specialist?.lastName || 'Specialist'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: '3px', background: '#fce7f3', color: '#9d174d' }}>
                      RECOMMENDATION
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '0.2rem' }}>
                    {referral.recommendation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
