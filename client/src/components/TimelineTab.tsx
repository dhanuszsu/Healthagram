import React, { useState } from 'react';
import { ClinicalEvent, ClinicalEventType } from '../types';
import { Clock, Filter, ArrowDownUp } from 'lucide-react';

interface TimelineTabProps {
  events: ClinicalEvent[];
  onOpenAddEvent: () => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({ events, onOpenAddEvent }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredEvents = events.filter((e) => {
    if (filterType === 'ALL') return true;
    return e.eventType === filterType;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  const getNodeClass = (type: ClinicalEventType) => {
    if (type === 'PRESCRIPTION') return 'node-prescription';
    if (type === 'MEDICATION_ADMINISTERED') return 'node-admin';
    if (type === 'MEDICATION_CHANGED' || type === 'TREATMENT_CHANGE') return 'node-change';
    if (type === 'SPECIALIST_REFERRAL' || type === 'SPECIALIST_REVIEW') return 'node-specialist';
    if (type.includes('INVESTIGATION') || type.includes('RESULT')) return 'node-investigation';
    return '';
  };

  const getRoleTag = (role?: string) => {
    if (role === 'SENIOR_DOCTOR') return <span className="author-role-tag tag-senior">Senior Attending</span>;
    if (role === 'JUNIOR_DOCTOR') return <span className="author-role-tag tag-junior">Junior Doctor</span>;
    if (role === 'SPECIALIST') return <span className="author-role-tag tag-specialist">Specialist</span>;
    return null;
  };

  return (
    <div className="tab-panel">
      <div className="panel-action-bar">
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>Clinical Timeline</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={14} color="#64748b" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
            >
              <option value="ALL">All Event Types ({events.length})</option>
              <option value="ASSESSMENT">Assessments & Vitals</option>
              <option value="PRESCRIPTION">Prescriptions</option>
              <option value="MEDICATION_ADMINISTERED">Medication Administered</option>
              <option value="MEDICATION_CHANGED">Medication Changed</option>
              <option value="SPECIALIST_REFERRAL">Specialist Referrals</option>
              <option value="SPECIALIST_REVIEW">Specialist Recommendations</option>
              <option value="INVESTIGATION_ORDERED">Investigations Ordered</option>
              <option value="LAB_RESULT">Lab & Diagnostic Results</option>
              <option value="SENIOR_INSTRUCTION">Senior Instructions</option>
            </select>
          </div>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <ArrowDownUp size={14} />
            {sortOrder === 'asc' ? 'Oldest → Newest' : 'Newest → Oldest'}
          </button>

          <button className="btn btn-primary btn-sm" onClick={onOpenAddEvent}>
            + Record Action
          </button>
        </div>
      </div>

      {sortedEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          No clinical events matching the selected filter.
        </div>
      ) : (
        <div className="timeline-stream">
          {sortedEvents.map((event) => {
            let metadataParsed = null;
            if (event.metadata) {
              try {
                metadataParsed = JSON.parse(event.metadata);
              } catch {
                metadataParsed = null;
              }
            }

            return (
              <div key={event.id} className="timeline-item">
                <div className={`timeline-node ${getNodeClass(event.eventType)}`} />

                <div className="timeline-item-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`event-type-badge event-type-${event.eventType}`}>
                      {event.eventType.replace(/_/g, ' ')}
                    </span>
                    {event.encounter && (
                      <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
                        [{event.encounter.type}]
                      </span>
                    )}
                  </div>

                  <div className="timeline-time">
                    <Clock size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    {new Date(event.createdAt).toLocaleDateString()} at{' '}
                    {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="timeline-title">{event.title}</div>
                <div className="timeline-desc">{event.description}</div>

                {metadataParsed && Object.keys(metadataParsed).length > 0 && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      background: '#f8fafc',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: '#475569'
                    }}
                  >
                    <strong>Metadata:</strong> {JSON.stringify(metadataParsed)}
                  </div>
                )}

                <div className="timeline-author-bar">
                  <span>Recorded by:</span>
                  <strong style={{ color: '#0f172a' }}>
                    Dr. {event.createdBy.firstName} {event.createdBy.lastName}
                  </strong>
                  {getRoleTag(event.createdBy.role)}
                  {event.createdBy.doctorProfile?.specialization && (
                    <span style={{ color: '#64748b' }}>
                      ({event.createdBy.doctorProfile.specialization})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
