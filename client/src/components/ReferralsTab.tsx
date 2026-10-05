import React from 'react';
import { SpecialistReferral, UserRole } from '../types';
import { Share2, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

interface ReferralsTabProps {
  referrals: SpecialistReferral[];
  currentUserRole?: UserRole;
  onOpenCreateReferral: () => void;
  onOpenRespondReferral: (referral: SpecialistReferral) => void;
}

export const ReferralsTab: React.FC<ReferralsTabProps> = ({
  referrals,
  currentUserRole,
  onOpenCreateReferral,
  onOpenRespondReferral
}) => {
  return (
    <div className="tab-panel">
      <div className="panel-action-bar">
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
            Specialist Referrals
          </h3>
        </div>

        <button className="btn btn-primary btn-sm" onClick={onOpenCreateReferral}>
          <Share2 size={14} /> + Request Specialist Referral
        </button>
      </div>

      {referrals.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          No specialist referrals requested for this patient.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {referrals.map((ref) => {
            const isCompleted = ref.status === 'COMPLETED' || !!ref.recommendation;

            return (
              <div
                key={ref.id}
                style={{
                  border: '1px solid var(--border-light)',
                  borderLeft: `4px solid ${isCompleted ? '#7c3aed' : '#f59e0b'}`,
                  borderRadius: '0.5rem',
                  padding: '1.25rem',
                  background: 'white',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                      Consultation: Dr. {ref.specialist.firstName} {ref.specialist.lastName}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.5rem' }}>
                      ({ref.specialist.doctorProfile?.specialization || 'Specialist'})
                    </span>
                    {ref.priority && ref.priority !== 'ROUTINE' && (
                      <span
                        style={{
                          marginLeft: '0.5rem',
                          background: '#fee2e2',
                          color: '#dc2626',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px'
                        }}
                      >
                        {ref.priority}
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      background: isCompleted ? '#ede9fe' : '#fef3c7',
                      color: isCompleted ? '#6b21a8' : '#92400e',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '9999px'
                    }}
                  >
                    {ref.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '0.5rem' }}>
                  <strong>Referral Reason:</strong> {ref.reason}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
                  <span>Requested by: Dr. {ref.referringDoctor.lastName} ({ref.referringDoctor.role.replace('_', ' ')})</span>
                  <span>Date: {new Date(ref.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Recommendation Box */}
                {ref.recommendation ? (
                  <div
                    style={{
                      background: '#faf5ff',
                      border: '1px solid #e9d5ff',
                      borderRadius: '0.375rem',
                      padding: '0.85rem',
                      marginTop: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#7c3aed', fontWeight: 700, fontSize: '0.825rem', marginBottom: '0.35rem' }}>
                      <CheckCircle2 size={15} /> Specialist Recommendation
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#1e293b', lineHeight: 1.5 }}>
                      "{ref.recommendation}"
                    </div>
                    {ref.recommendationAt && (
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                        Submitted: {new Date(ref.recommendationAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: '#92400e', fontStyle: 'italic' }}>
                      Pending review by specialist.
                    </span>

                    {currentUserRole === 'SPECIALIST' && (
                      <button className="btn btn-primary btn-sm" onClick={() => onOpenRespondReferral(ref)}>
                        <MessageSquare size={14} /> Submit Specialist Recommendation
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
