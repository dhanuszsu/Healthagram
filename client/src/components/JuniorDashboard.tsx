import React from 'react';
import { Patient, User, SeniorApproach } from '../types';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface JuniorDashboardProps {
  currentUser: User;
  patients: Patient[];
  approaches: SeniorApproach[];
  onOpenPatientRecord: (patientId: string) => void;
  onNavigateToApproach: (approachId?: string) => void;
}

export const JuniorDashboard: React.FC<JuniorDashboardProps> = ({
  currentUser,
  patients,
  approaches,
  onOpenPatientRecord,
  onNavigateToApproach
}) => {
  // 1. My Patients: assigned to junior or active admissions
  const myPatients = patients.filter((p) => {
    const isAssigned = p.patientAssignments?.some(
      (a) => a.active && a.doctor.id === currentUser.id
    );
    return isAssigned || p.encounters?.some((e) => e.status === 'ACTIVE');
  });

  // 2. Actionable Tasks:
  // - Due medication administrations
  // - Ordered investigations
  interface TaskRow {
    id: string;
    patientId: string;
    patientName: string;
    patientAge: number;
    patientGender: string;
    mrn: string;
    type: string;
    detail: string;
    urgency: string;
  }

  const tasks: TaskRow[] = [];
  myPatients.forEach((patient) => {
    (patient.prescriptions || [])
      .filter((rx) => rx.status === 'ACTIVE')
      .forEach((rx) => {
        const lastAdmin = rx.administrations && rx.administrations.length > 0 ? rx.administrations[0] : null;
        tasks.push({
          id: `task-rx-${rx.id}`,
          patientId: patient.id,
          patientName: patient.name,
          patientAge: patient.age,
          patientGender: patient.gender,
          mrn: patient.mrn,
          type: 'MEDICATION DUE',
          detail: `${rx.medication} ${rx.dosage} (${rx.route}, ${rx.frequency})`,
          urgency: lastAdmin ? 'Due Next Dose' : 'Initial Dose Pending'
        });
      });

    (patient.investigations || [])
      .filter((inv) => inv.status !== 'COMPLETED' && inv.status !== 'CANCELLED')
      .forEach((inv) => {
        tasks.push({
          id: `task-inv-${inv.id}`,
          patientId: patient.id,
          patientName: patient.name,
          patientAge: patient.age,
          patientGender: patient.gender,
          mrn: patient.mrn,
          type: 'INVESTIGATION',
          detail: `${inv.title} (${inv.priority})`,
          urgency: inv.status
        });
      });
  });

  // 3. Clinical Updates:
  // - Specialist recommendations
  // - Medication changes / discontinuations
  // - Senior directives
  interface UpdateRow {
    id: string;
    patientId: string;
    patientName: string;
    mrn: string;
    type: string;
    author: string;
    summary: string;
    timestamp: string;
  }

  const updates: UpdateRow[] = [];
  myPatients.forEach((patient) => {
    (patient.specialistReferrals || [])
      .filter((ref) => !!ref.recommendation)
      .forEach((ref) => {
        updates.push({
          id: `up-ref-${ref.id}`,
          patientId: patient.id,
          patientName: patient.name,
          mrn: patient.mrn,
          type: 'SPECIALIST RECOMMENDATION',
          author: `Dr. ${ref.specialist?.lastName || 'Consultant'}`,
          summary: ref.recommendation || '',
          timestamp: ref.recommendationAt ? new Date(ref.recommendationAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
        });
      });

    (patient.prescriptions || [])
      .filter((rx) => rx.status === 'CHANGED' || rx.status === 'STOPPED')
      .forEach((rx) => {
        updates.push({
          id: `up-rx-${rx.id}`,
          patientId: patient.id,
          patientName: patient.name,
          mrn: patient.mrn,
          type: rx.status === 'CHANGED' ? 'MEDICATION CHANGED' : 'MEDICATION STOPPED',
          author: rx.changedBy ? `Dr. ${rx.changedBy.lastName}` : 'Attending',
          summary: `${rx.medication} ${rx.dosage}${rx.changeReason ? ` — ${rx.changeReason}` : ''}`,
          timestamp: new Date(rx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      });

    (patient.clinicalCommunications || []).forEach((comm) => {
      updates.push({
        id: `up-comm-${comm.id}`,
        patientId: patient.id,
        patientName: patient.name,
        mrn: patient.mrn,
        type: 'INSTRUCTION / HANDOVER',
        author: `Dr. ${comm.sender.lastName}`,
        summary: `${comm.subject}: ${comm.content}`,
        timestamp: new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 1. MY PATIENTS */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
        <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
            MY PATIENTS ({myPatients.length})
          </span>
        </div>

        {myPatients.length === 0 ? (
          <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
            No assigned patients.
          </div>
        ) : (
          <table className="clinical-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.5rem 0.85rem' }}>Patient</th>
                <th style={{ padding: '0.5rem 0.85rem' }}>MRN</th>
                <th style={{ padding: '0.5rem 0.85rem' }}>Condition / History</th>
                <th style={{ padding: '0.5rem 0.85rem' }}>Allergies</th>
                <th style={{ padding: '0.5rem 0.85rem' }}>Lead Attending</th>
                <th style={{ padding: '0.5rem 0.85rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {myPatients.map((patient) => {
                const activeEncounter = patient.encounters?.find((e) => e.status === 'ACTIVE') || patient.encounters?.[0];
                const leadDoctor = patient.patientAssignments?.find((a) => a.isPrimary)?.doctor;

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
                      {activeEncounter?.reason || patient.medicalHistory || 'Under Observation'}
                    </td>
                    <td style={{ padding: '0.5rem 0.85rem' }}>
                      {patient.allergies ? (
                        <span style={{ color: '#dc2626', fontWeight: 600 }}>{patient.allergies}</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '0.5rem 0.85rem', color: '#475569' }}>
                      {leadDoctor ? `Dr. ${leadDoctor.lastName}` : 'Attending'}
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
                        Open
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Grid: 2. MY TASKS & 3. CLINICAL UPDATES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1rem' }}>
        {/* 2. MY TASKS */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
          <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
              MY TASKS ({tasks.length})
            </span>
          </div>

          {tasks.length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
              No pending tasks.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    padding: '0.6rem 0.85rem',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => onOpenPatientRecord(task.patientId)}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <strong style={{ fontSize: '0.825rem', color: '#0f172a' }}>{task.patientName}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{task.patientAge} · {task.patientGender}</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: '3px', background: task.type === 'MEDICATION DUE' ? '#dcfce7' : '#e0f2fe', color: task.type === 'MEDICATION DUE' ? '#15803d' : '#0369a1' }}>
                        {task.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.775rem', color: '#334155', marginTop: '0.15rem' }}>
                      {task.detail}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>Open →</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. CLINICAL UPDATES */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
          <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
              CLINICAL UPDATES ({updates.length})
            </span>
          </div>

          {updates.length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
              No new clinical updates.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '340px', overflowY: 'auto' }}>
              {updates.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '0.6rem 0.85rem',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer'
                  }}
                  onClick={() => onOpenPatientRecord(item.patientId)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.825rem', color: '#0f172a' }}>{item.patientName}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '0.4rem' }}>{item.author}</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: '3px', background: item.type.includes('SPECIALIST') ? '#fce7f3' : '#fef3c7', color: item.type.includes('SPECIALIST') ? '#9d174d' : '#92400e' }}>
                      {item.type}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '0.2rem' }}>
                    {item.summary}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. SENIOR APPROACH (DEDICATED SECTION FOR JUNIOR ONLY) */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
        <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
            SENIOR APPROACH ({approaches.length})
          </span>
          <button
            className="btn-switch"
            style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem' }}
            onClick={() => onNavigateToApproach()}
          >
            Browse Library
          </button>
        </div>

        {approaches.length === 0 ? (
          <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
            No Senior Approach cases shared yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem', padding: '0.75rem' }}>
            {approaches.slice(0, 3).map((app) => (
              <div
                key={app.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  padding: '0.75rem',
                  background: '#f8fafc',
                  cursor: 'pointer'
                }}
                onClick={() => onNavigateToApproach(app.id)}
              >
                <div style={{ fontWeight: 700, fontSize: '0.825rem', color: '#0f172a' }}>
                  {app.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', margin: '0.2rem 0' }}>
                  Dr. {app.seniorDoctor.lastName} · Patient: {app.patient.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#334155', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  <strong>Decision:</strong> {app.decision}
                </div>
                <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: '#0284c7', fontWeight: 600 }}>
                  View Decision Approach →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
