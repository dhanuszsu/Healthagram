import React, { useState } from 'react';
import { SeniorApproach } from '../types';
import { ArrowRight, FileText } from 'lucide-react';

interface SeniorApproachSectionProps {
  approaches: SeniorApproach[];
  initialSelectedId?: string | null;
  onOpenPatientRecord: (patientId: string) => void;
  currentUserRole?: string;
  onOpenShareApproach?: () => void;
}

export const SeniorApproachSection: React.FC<SeniorApproachSectionProps> = ({
  approaches,
  initialSelectedId,
  onOpenPatientRecord
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(
    initialSelectedId || approaches[0]?.id || null
  );

  React.useEffect(() => {
    if (initialSelectedId) {
      setSelectedCaseId(initialSelectedId);
    }
  }, [initialSelectedId]);

  const activeCase = approaches.find((a) => a.id === selectedCaseId) || approaches[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header Bar */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.65rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a', textTransform: 'uppercase' }}>
          SENIOR APPROACH ({approaches.length} CASES)
        </span>
      </div>

      {approaches.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
          No Senior Approach cases available.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1rem', alignItems: 'start' }}>
          {/* Left Column: Case Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {approaches.map((c) => {
              const isSelected = c.id === activeCase?.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  style={{
                    background: isSelected ? '#f0f9ff' : '#ffffff',
                    border: `1px solid ${isSelected ? '#0284c7' : '#e2e8f0'}`,
                    borderLeft: isSelected ? '4px solid #0284c7' : '1px solid #e2e8f0',
                    borderRadius: '4px',
                    padding: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Dr. {c.seniorDoctor.lastName} · {c.patient.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Case Details */}
          {activeCase && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {activeCase.title}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Attending: Dr. {activeCase.seniorDoctor.firstName} {activeCase.seniorDoctor.lastName} · {new Date(activeCase.sharedAt).toLocaleDateString()}
                  </div>
                </div>

                <button
                  className="btn-switch active"
                  onClick={() => onOpenPatientRecord(activeCase.patientId)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                >
                  <FileText size={13} />
                  <span>Open Clinical Record</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Patient Tag */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#334155' }}>
                <strong>Patient:</strong> {activeCase.patient.name} · {activeCase.patient.age}y · {activeCase.patient.gender} · MRN: {activeCase.patient.mrn}
              </div>

              {/* Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Clinical Situation
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#1e293b', marginTop: '0.15rem' }}>
                    {activeCase.situation}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Senior Assessment
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#1e293b', marginTop: '0.15rem' }}>
                    {activeCase.assessment}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Senior Decision
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 600, marginTop: '0.15rem' }}>
                    {activeCase.decision}
                  </div>
                </div>

                {activeCase.treatmentApproach && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Treatment / Prescribing Approach
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#1e293b', marginTop: '0.15rem' }}>
                      {activeCase.treatmentApproach}
                    </div>
                  </div>
                )}

                {activeCase.reasoning && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Clinical Reasoning
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#1e293b', marginTop: '0.15rem' }}>
                      {activeCase.reasoning}
                    </div>
                  </div>
                )}

                {activeCase.outcome && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Outcome / Follow-up
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#1e293b', marginTop: '0.15rem' }}>
                      {activeCase.outcome}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
