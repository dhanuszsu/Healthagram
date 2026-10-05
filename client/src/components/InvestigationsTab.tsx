import React from 'react';
import { Investigation } from '../types';
import { Microscope, CheckCircle2, Clock, FilePlus, Eye } from 'lucide-react';

interface InvestigationsTabProps {
  investigations: Investigation[];
  onOpenOrderInvestigation: () => void;
  onOpenRecordResult: (inv: Investigation) => void;
}

export const InvestigationsTab: React.FC<InvestigationsTabProps> = ({
  investigations,
  onOpenOrderInvestigation,
  onOpenRecordResult
}) => {
  return (
    <div className="tab-panel">
      <div className="panel-action-bar">
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
            Diagnostic Investigations
          </h3>
        </div>

        <button className="btn btn-primary btn-sm" onClick={onOpenOrderInvestigation}>
          <FilePlus size={14} /> + Order Investigation
        </button>
      </div>

      {investigations.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          No investigations ordered for this patient.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {investigations.map((inv) => {
            const hasResults = inv.results && inv.results.length > 0;
            const latestResult = hasResults ? inv.results![0] : null;

            return (
              <div
                key={inv.id}
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: '0.5rem',
                  padding: '1.25rem',
                  background: 'white',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: inv.type === 'LAB' ? '#e0f2fe' : '#ede9fe',
                        color: inv.type === 'LAB' ? '#0369a1' : '#6b21a8',
                        marginRight: '0.5rem'
                      }}
                    >
                      {inv.type}
                    </span>
                    <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{inv.title}</strong>
                    {inv.priority && inv.priority !== 'ROUTINE' && (
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
                        {inv.priority}
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      background: inv.status === 'COMPLETED' ? '#d1fae5' : '#fef3c7',
                      color: inv.status === 'COMPLETED' ? '#065f46' : '#92400e',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '9999px'
                    }}
                  >
                    {inv.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>
                  <strong>Indication:</strong> {inv.clinicalIndication}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
                  <span>Ordered by: Dr. {inv.orderedBy.lastName} ({inv.orderedBy.role.replace('_', ' ')})</span>
                  <span>Ordered on: {new Date(inv.orderedAt).toLocaleString()}</span>
                </div>

                {/* Results Section */}
                {latestResult ? (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.375rem',
                      padding: '0.75rem',
                      marginTop: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={14} /> Diagnostic Result ({latestResult.status})
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        Reported: {new Date(latestResult.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.35rem' }}>
                      <strong>Findings:</strong> {latestResult.findings}
                    </div>

                    {latestResult.impressions && (
                      <div style={{ fontSize: '0.825rem', color: '#334155' }}>
                        <strong>Impression:</strong> {latestResult.impressions}
                      </div>
                    )}

                    {latestResult.reportedBy && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                        Reported by: Dr. {latestResult.reportedBy.lastName}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#92400e', fontStyle: 'italic' }}>
                      Result pending from laboratory / imaging department.
                    </span>
                    <button className="btn btn-outline btn-sm" onClick={() => onOpenRecordResult(inv)}>
                      + Enter Result Findings
                    </button>
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
