import React, { useState, useEffect } from 'react';
import {
  Patient,
  User,
  ClinicalEvent,
  Prescription,
  Investigation,
  SpecialistReferral,
  ClinicalCommunication,
  WhatChangedData
} from '../types';
import { api } from '../api';
import {
  Clock,
  Pill,
  Microscope,
  Share2,
  MessageSquare,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Plus,
  RefreshCw
} from 'lucide-react';

interface SharedPatientPageProps {
  currentUser: User;
  patient: Patient;
  onRefreshPatient: () => void;
  onOpenAddEvent: () => void;
  onOpenNewPrescription: () => void;
  onOpenChangePrescription: (rx: Prescription) => void;
  onOpenAdminister: (rx: Prescription) => void;
  onStopPrescription: (rx: Prescription) => void;
  onOpenOrderInvestigation: () => void;
  onOpenRecordResult: (inv: Investigation) => void;
  onOpenCreateReferral: () => void;
  onOpenRespondReferral: (ref: SpecialistReferral) => void;
  onOpenCreateCommunication: () => void;
  onOpenShareSeniorApproach?: () => void;
  onNavigateToApproach?: (approachId?: string) => void;
}

export const SharedPatientPage: React.FC<SharedPatientPageProps> = ({
  currentUser,
  patient,
  onRefreshPatient,
  onOpenAddEvent,
  onOpenNewPrescription,
  onOpenChangePrescription,
  onOpenAdminister,
  onStopPrescription,
  onOpenOrderInvestigation,
  onOpenRecordResult,
  onOpenCreateReferral,
  onOpenRespondReferral,
  onOpenCreateCommunication
}) => {
  const [whatChanged, setWhatChanged] = useState<WhatChangedData | null>(null);
  const [loadingChanges, setLoadingChanges] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'treatment' | 'investigations' | 'consults' | 'timeline' | 'team'>('treatment');

  useEffect(() => {
    let isMounted = true;
    const loadChanges = async () => {
      try {
        setLoadingChanges(true);
        const data = await api.getWhatChanged(patient.id);
        if (isMounted) setWhatChanged(data);
      } catch (err) {
        console.error('Failed to fetch what-changed data:', err);
      } finally {
        if (isMounted) setLoadingChanges(false);
      }
    };
    loadChanges();
    return () => {
      isMounted = false;
    };
  }, [patient.id, currentUser.id]);

  const handleAcknowledgeChanges = async () => {
    try {
      await api.markPatientViewed(patient.id);
      const data = await api.getWhatChanged(patient.id);
      setWhatChanged(data);
    } catch (err) {
      console.error('Failed to mark patient as viewed:', err);
    }
  };

  const activeEncounter = patient.encounters?.find((e) => e.status === 'ACTIVE');
  const activePrescriptions = (patient.prescriptions || []).filter((p) => p.status === 'ACTIVE');
  const pastPrescriptions = (patient.prescriptions || []).filter((p) => p.status !== 'ACTIVE');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* 1. PATIENT HEADER & CURRENT STATUS */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {patient.name}
              </h2>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', background: '#f1f5f9', color: '#475569', padding: '0.1rem 0.4rem', borderRadius: '3px', fontWeight: 600 }}>
                {patient.mrn}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {patient.age} · {patient.gender} · DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '3px', background: activeEncounter ? '#dcfce7' : '#f1f5f9', color: activeEncounter ? '#15803d' : '#64748b' }}>
                {activeEncounter ? `${activeEncounter.type} - ACTIVE` : 'OUTPATIENT'}
              </span>
            </div>

            <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: '#334155' }}>
              <strong>Condition:</strong> {activeEncounter?.reason || patient.medicalHistory || 'Under Observation'}
              {patient.allergies && (
                <span style={{ color: '#dc2626', fontWeight: 700, marginLeft: '0.75rem' }}>
                  ⚠️ Allergies: {patient.allergies}
                </span>
              )}
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button className="btn-switch" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }} onClick={onOpenAddEvent}>
              + Note
            </button>
            {(currentUser.role === 'SENIOR_DOCTOR' || currentUser.role === 'SPECIALIST') && (
              <button className="btn-switch" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }} onClick={onOpenNewPrescription}>
                + Prescribe
              </button>
            )}
            <button className="btn-switch" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }} onClick={onOpenOrderInvestigation}>
              + Test
            </button>
            <button className="btn-switch" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }} onClick={onOpenCreateReferral}>
              + Consult
            </button>
            <button className="btn-switch" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }} onClick={onOpenCreateCommunication}>
              + Handover
            </button>
            <button className="btn-switch" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }} onClick={onRefreshPatient} title="Refresh">
              <RefreshCw size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. WHAT CHANGED (CLEAN & COMPACT) */}
      <div style={{ background: '#ffffff', border: whatChanged && whatChanged.totalChanges > 0 ? '1px solid #fed7aa' : '1px solid #e2e8f0', borderRadius: '4px' }}>
        <div style={{ padding: '0.5rem 0.85rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: whatChanged && whatChanged.totalChanges > 0 ? '#fffaf5' : '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
              WHAT CHANGED
            </span>
            {whatChanged && (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.05rem 0.35rem', borderRadius: '3px', background: whatChanged.totalChanges > 0 ? '#ea580c' : '#f1f5f9', color: whatChanged.totalChanges > 0 ? '#ffffff' : '#64748b' }}>
                {whatChanged.totalChanges}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {whatChanged?.lastViewedAt
                ? `Last viewed: ${new Date(whatChanged.lastViewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'First viewing'}
            </span>
            <button
              className="btn-switch"
              style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}
              onClick={handleAcknowledgeChanges}
              title="Acknowledge recent changes"
            >
              Mark Viewed
            </button>
          </div>
        </div>

        {loadingChanges ? (
          <div style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>Checking changes...</div>
        ) : !whatChanged || whatChanged.totalChanges === 0 ? (
          <div style={{ padding: '0.75rem 0.85rem', fontSize: '0.75rem', color: '#64748b' }}>
            No new changes since last visit.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {whatChanged.recentEvents.map((ev) => (
              <div key={ev.id} style={{ padding: '0.45rem 0.85rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ color: '#0f172a' }}>{ev.title}</strong>
                  <span style={{ color: '#475569', marginLeft: '0.4rem' }}>{ev.description}</span>
                </div>
                <span style={{ color: '#64748b', fontSize: '0.7rem' }}>
                  Dr. {ev.createdBy.lastName} · {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {whatChanged.recentPrescriptions.map((rx) => (
              <div key={rx.id} style={{ padding: '0.45rem 0.85rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ color: '#9a3412' }}>Rx Update: {rx.medication} {rx.dosage}</strong>
                  <span style={{ color: '#475569', marginLeft: '0.4rem' }}>Status: {rx.status}{rx.changeReason ? ` (${rx.changeReason})` : ''}</span>
                </div>
                <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Dr. {rx.prescribedBy.lastName}</span>
              </div>
            ))}

            {whatChanged.recentInvestigations.map((inv) => (
              <div key={inv.id} style={{ padding: '0.45rem 0.85rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ color: '#0369a1' }}>Test: {inv.title}</strong>
                  <span style={{ color: '#475569', marginLeft: '0.4rem' }}>Status: {inv.status}</span>
                </div>
                <span style={{ color: '#64748b', fontSize: '0.7rem' }}>{inv.priority}</span>
              </div>
            ))}

            {whatChanged.recentReferrals.map((ref) => (
              <div key={ref.id} style={{ padding: '0.45rem 0.85rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ color: '#9d174d' }}>Consult: {ref.reason}</strong>
                  {ref.recommendation && <span style={{ color: '#831843', marginLeft: '0.4rem' }}>Rec: {ref.recommendation}</span>}
                </div>
                <span style={{ color: '#64748b', fontSize: '0.7rem' }}>{ref.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clinical Subtabs */}
      <nav style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem' }}>
        <button
          className={`btn-switch ${activeSubTab === 'treatment' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('treatment')}
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
        >
          Treatment & Meds ({activePrescriptions.length})
        </button>
        <button
          className={`btn-switch ${activeSubTab === 'investigations' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('investigations')}
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
        >
          Investigations ({(patient.investigations || []).length})
        </button>
        <button
          className={`btn-switch ${activeSubTab === 'consults' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('consults')}
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
        >
          Consultations ({(patient.specialistReferrals || []).length})
        </button>
        <button
          className={`btn-switch ${activeSubTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('timeline')}
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
        >
          Timeline
        </button>
        <button
          className={`btn-switch ${activeSubTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('team')}
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
        >
          Care Team ({(patient.patientAssignments || []).length})
        </button>
      </nav>

      {/* SUBTAB 1: TREATMENT & MEDICATIONS */}
      {activeSubTab === 'treatment' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
          <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
              CURRENT TREATMENT & MEDICATIONS
            </span>
          </div>

          {activePrescriptions.length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
              No active prescriptions.
            </div>
          ) : (
            <table className="clinical-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.5rem 0.85rem' }}>Medication</th>
                  <th style={{ padding: '0.5rem 0.85rem' }}>Dosage & Route</th>
                  <th style={{ padding: '0.5rem 0.85rem' }}>Frequency</th>
                  <th style={{ padding: '0.5rem 0.85rem' }}>Instructions / Notes</th>
                  <th style={{ padding: '0.5rem 0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activePrescriptions.map((rx) => (
                  <tr key={rx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.5rem 0.85rem' }}>
                      <strong style={{ color: '#0f172a' }}>{rx.medication}</strong>
                      {rx.changeReason && (
                        <div style={{ fontSize: '0.7rem', color: '#9a3412' }}>{rx.changeReason}</div>
                      )}
                    </td>
                    <td style={{ padding: '0.5rem 0.85rem', color: '#334155' }}>{rx.dosage} · {rx.route}</td>
                    <td style={{ padding: '0.5rem 0.85rem', color: '#334155' }}>{rx.frequency}</td>
                    <td style={{ padding: '0.5rem 0.85rem', color: '#475569' }}>{rx.instructions || '—'}</td>
                    <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                        {currentUser.role === 'JUNIOR_DOCTOR' && (
                          <button
                            className="btn-switch active"
                            style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}
                            onClick={() => onOpenAdminister(rx)}
                          >
                            Administer
                          </button>
                        )}
                        {(currentUser.role === 'SENIOR_DOCTOR' || currentUser.role === 'SPECIALIST') && (
                          <>
                            <button
                              className="btn-switch"
                              style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}
                              onClick={() => onOpenChangePrescription(rx)}
                            >
                              Modify
                            </button>
                            <button
                              className="btn-switch"
                              style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', color: '#dc2626' }}
                              onClick={() => onStopPrescription(rx)}
                            >
                              Stop
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Discontinued medications */}
          {pastPrescriptions.length > 0 && (
            <div style={{ borderTop: '1px solid #e2e8f0', padding: '0.5rem 0.85rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Discontinued / Changed Regimen:
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                {pastPrescriptions.map((rx) => (
                  <span
                    key={rx.id}
                    style={{
                      fontSize: '0.7rem',
                      background: '#f1f5f9',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '3px',
                      color: '#475569',
                      textDecoration: 'line-through'
                    }}
                  >
                    {rx.medication} {rx.dosage} ({rx.status})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: INVESTIGATIONS */}
      {activeSubTab === 'investigations' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
          <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
              INVESTIGATIONS ({(patient.investigations || []).length})
            </span>
          </div>

          {(patient.investigations || []).length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
              No investigations ordered.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {(patient.investigations || []).map((inv) => (
                <div key={inv.id} style={{ padding: '0.65rem 0.85rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.825rem', color: '#0f172a' }}>{inv.title}</strong>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.05rem 0.35rem', borderRadius: '3px', background: inv.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7', color: inv.status === 'COMPLETED' ? '#15803d' : '#b45309' }}>
                        {inv.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.15rem' }}>
                      {inv.clinicalIndication} · Ordered by Dr. {inv.orderedBy.lastName}
                    </div>
                    {inv.results && inv.results.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#0369a1', marginTop: '0.2rem' }}>
                        <strong>Result:</strong> {inv.results[0].findings}{inv.results[0].values ? ` · ${inv.results[0].values}` : ''}
                      </div>
                    )}
                  </div>
                  {inv.status !== 'COMPLETED' && (
                    <button
                      className="btn-switch"
                      style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}
                      onClick={() => onOpenRecordResult(inv)}
                    >
                      Record Result
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: SPECIALIST CONSULTATIONS */}
      {activeSubTab === 'consults' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
          <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
              SPECIALIST CONSULTATIONS ({(patient.specialistReferrals || []).length})
            </span>
          </div>

          {(patient.specialistReferrals || []).length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
              No specialist consultations on record.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {(patient.specialistReferrals || []).map((ref) => (
                <div key={ref.id} style={{ padding: '0.75rem 0.85rem', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.825rem', color: '#9d174d' }}>
                      {ref.specialist?.doctorProfile?.specialization || 'Specialist Consult'} ({ref.status})
                    </strong>
                    {currentUser.role === 'SPECIALIST' && ref.status !== 'COMPLETED' && (
                      <button
                        className="btn-switch active"
                        style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}
                        onClick={() => onOpenRespondReferral(ref)}
                      >
                        Respond
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '0.2rem' }}>
                    <strong>Query:</strong> {ref.reason}
                  </div>
                  {ref.recommendation && (
                    <div style={{ fontSize: '0.75rem', color: '#831843', marginTop: '0.25rem', background: '#fdf2f8', padding: '0.35rem 0.5rem', borderRadius: '3px' }}>
                      <strong>Recommendation:</strong> {ref.recommendation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: TIMELINE */}
      {activeSubTab === 'timeline' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
          <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
              CLINICAL TIMELINE
            </span>
          </div>
          <div style={{ padding: '1rem', fontSize: '0.8rem', color: '#475569' }}>
            All clinical entries, vitals, prescriptions, and administrations are audited in chronological order on the shared record.
          </div>
        </div>
      )}

      {/* SUBTAB 5: CARE TEAM */}
      {activeSubTab === 'team' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
          <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
              CARE TEAM & HANDOVER
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', padding: '0.75rem' }}>
            {(patient.patientAssignments || []).map((assignment) => (
              <div key={assignment.id} style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.6rem 0.75rem', background: '#f8fafc' }}>
                <div style={{ fontWeight: 700, fontSize: '0.825rem', color: '#0f172a' }}>
                  Dr. {assignment.doctor.firstName} {assignment.doctor.lastName}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {assignment.doctor.role.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
