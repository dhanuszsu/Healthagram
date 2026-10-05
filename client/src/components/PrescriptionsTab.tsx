import React from 'react';
import { Prescription, UserRole } from '../types';
import { Pill, CheckCircle2, Clock, RotateCw, Ban, User } from 'lucide-react';

interface PrescriptionsTabProps {
  prescriptions: Prescription[];
  currentUserRole?: UserRole;
  onOpenNewPrescription: () => void;
  onOpenChangePrescription: (rx: Prescription) => void;
  onOpenAdminister: (rx: Prescription) => void;
  onStopPrescription: (rx: Prescription) => void;
}

export const PrescriptionsTab: React.FC<PrescriptionsTabProps> = ({
  prescriptions,
  currentUserRole,
  onOpenNewPrescription,
  onOpenChangePrescription,
  onOpenAdminister,
  onStopPrescription
}) => {
  const activeRx = prescriptions.filter((p) => p.status === 'ACTIVE');
  const historicalRx = prescriptions.filter((p) => p.status !== 'ACTIVE');

  const canPrescribeOrChange =
    currentUserRole === 'SENIOR_DOCTOR' || currentUserRole === 'SPECIALIST';

  return (
    <div className="tab-panel">
      <div className="panel-action-bar">
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
            Prescriptions
          </h3>
        </div>

        <button className="btn btn-primary btn-sm" onClick={onOpenNewPrescription}>
          <Pill size={14} /> + New Prescription
        </button>
      </div>

      {/* Active Regimen */}
      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <CheckCircle2 size={16} /> Currently Active Regimens ({activeRx.length})
      </h4>

      {activeRx.length === 0 ? (
        <div style={{ padding: '1rem', color: '#64748b', background: '#f8fafc', borderRadius: '0.5rem', border: '1px dashed #cbd5e1' }}>
          No active prescriptions for this patient.
        </div>
      ) : (
        <div className="prescriptions-grid">
          {activeRx.map((rx) => (
            <div key={rx.id} className="rx-card rx-active">
              <div className="rx-header">
                <div>
                  <span className="rx-med-name">{rx.medication}</span>
                  <span style={{ marginLeft: '0.5rem', fontWeight: 600, color: '#0284c7' }}>
                    {rx.dosage}
                  </span>
                </div>
                <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                  ACTIVE
                </span>
              </div>

              <div className="rx-details-row">
                <span className="rx-detail-item"><strong>Frequency:</strong> {rx.frequency}</span>
                <span className="rx-detail-item"><strong>Route:</strong> {rx.route}</span>
                <span className="rx-detail-item"><strong>Duration:</strong> {rx.duration}</span>
                {rx.instructions && (
                  <span className="rx-detail-item"><strong>Instructions:</strong> {rx.instructions}</span>
                )}
              </div>

              {rx.previousPrescription && (
                <div className="rx-lineage-note">
                  ↳ <strong>Treatment Transition:</strong> Supersedes previous prescription of{' '}
                  <em>{rx.previousPrescription.medication} {rx.previousPrescription.dosage}</em>.
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', gap: '1rem' }}>
                <span>Prescribed by: Dr. {rx.prescribedBy.lastName} ({rx.prescribedBy.role.replace('_', ' ')})</span>
                <span>Date: {new Date(rx.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Administrations Log */}
              {rx.administrations && rx.administrations.length > 0 && (
                <div style={{ marginTop: '0.5rem', background: '#f8fafc', padding: '0.6rem 0.85rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                    Medication Administrations ({rx.administrations.length}):
                  </div>
                  {rx.administrations.map((admin) => (
                    <div key={admin.id} style={{ fontSize: '0.75rem', color: '#334155', display: 'flex', justifyContent: 'space-between', padding: '0.15rem 0' }}>
                      <span>
                        • Dose <strong>{admin.dose}</strong> ({admin.status}) administered by Dr. {admin.administeredBy.lastName} ({admin.administeredBy.role.replace('_', ' ')})
                        {admin.notes && ` — "${admin.notes}"`}
                      </span>
                      <span style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                        {new Date(admin.administeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="rx-actions">
                <button className="btn btn-outline btn-sm" onClick={() => onOpenAdminister(rx)}>
                  <CheckCircle2 size={14} color="#059669" /> Record Administration (Give Dose)
                </button>

                {canPrescribeOrChange ? (
                  <>
                    <button className="btn btn-outline btn-sm" onClick={() => onOpenChangePrescription(rx)}>
                      <RotateCw size={14} color="#d97706" /> Change Treatment Regimen
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => onStopPrescription(rx)}>
                      <Ban size={14} /> Discontinue
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: '0.725rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    (Treatment changes require Senior Doctor or Specialist authority)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Historical Prescriptions */}
      {historicalRx.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} /> Discontinued & Superseded Regimens ({historicalRx.length})
          </h4>

          <div className="prescriptions-grid">
            {historicalRx.map((rx) => (
              <div key={rx.id} className={`rx-card ${rx.status === 'CHANGED' ? 'rx-changed' : 'rx-stopped'}`}>
                <div className="rx-header">
                  <div>
                    <span className="rx-med-name" style={{ textDecoration: 'line-through', color: '#64748b' }}>
                      {rx.medication}
                    </span>
                    <span style={{ marginLeft: '0.5rem', color: '#64748b' }}>{rx.dosage}</span>
                  </div>
                  <span style={{ background: rx.status === 'CHANGED' ? '#fef3c7' : '#fee2e2', color: rx.status === 'CHANGED' ? '#92400e' : '#991b1b', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {rx.status}
                  </span>
                </div>

                <div className="rx-details-row">
                  <span className="rx-detail-item"><strong>Route:</strong> {rx.route}</span>
                  <span className="rx-detail-item"><strong>Frequency:</strong> {rx.frequency}</span>
                  {rx.stoppedAt && (
                    <span className="rx-detail-item">
                      <strong>Stopped:</strong> {new Date(rx.stoppedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {rx.changeReason && (
                  <div style={{ fontSize: '0.8rem', color: '#92400e', background: 'rgba(217, 119, 6, 0.1)', padding: '0.4rem 0.6rem', borderRadius: '0.25rem' }}>
                    <strong>Clinical Reason:</strong> {rx.changeReason}
                    {rx.changedBy && ` (By Dr. ${rx.changedBy.lastName})`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
