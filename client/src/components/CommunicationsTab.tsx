import React from 'react';
import { ClinicalCommunication } from '../types';
import { MessageSquare, Send, Check } from 'lucide-react';

interface CommunicationsTabProps {
  communications: ClinicalCommunication[];
  onOpenCreateCommunication: () => void;
}

export const CommunicationsTab: React.FC<CommunicationsTabProps> = ({
  communications,
  onOpenCreateCommunication
}) => {
  return (
    <div className="tab-panel">
      <div className="panel-action-bar">
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
            Clinical Communications
          </h3>
        </div>

        <button className="btn btn-primary btn-sm" onClick={onOpenCreateCommunication}>
          <Send size={14} /> + New Clinical Communication
        </button>
      </div>

      {communications.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          No patient-linked clinical communications.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {communications.map((comm) => (
            <div
              key={comm.id}
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: '0.5rem',
                padding: '1rem 1.25rem',
                background: 'white',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      background: comm.type === 'SENIOR_INSTRUCTION' ? '#fee2e2' : '#e0f2fe',
                      color: comm.type === 'SENIOR_INSTRUCTION' ? '#991b1b' : '#0369a1',
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px'
                    }}
                  >
                    {comm.type.replace(/_/g, ' ')}
                  </span>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{comm.subject}</strong>
                </div>

                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  {new Date(comm.createdAt).toLocaleString()}
                </span>
              </div>

              <div style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5, margin: '0.5rem 0' }}>
                {comm.content}
              </div>

              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                <span>
                  From: <strong>Dr. {comm.sender.lastName}</strong> ({comm.sender.role.replace('_', ' ')})
                  {comm.receiver && ` → To: Dr. ${comm.receiver.lastName}`}
                </span>

                {comm.isAcknowledged && (
                  <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Check size={14} /> Acknowledged
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
