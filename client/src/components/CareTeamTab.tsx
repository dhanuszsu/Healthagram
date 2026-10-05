import React from 'react';
import { PatientAssignment } from '../types';
import { UserCheck, ShieldCheck, UserPlus } from 'lucide-react';

interface CareTeamTabProps {
  assignments: PatientAssignment[];
  onOpenAssignDoctor: () => void;
}

export const CareTeamTab: React.FC<CareTeamTabProps> = ({ assignments, onOpenAssignDoctor }) => {
  const activeAssignments = assignments.filter((a) => a.active);
  const pastAssignments = assignments.filter((a) => !a.active);

  return (
    <div className="tab-panel">
      <div className="panel-action-bar">
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
            Care Team
          </h3>
        </div>

        <button className="btn btn-primary btn-sm" onClick={onOpenAssignDoctor}>
          <UserPlus size={14} /> + Assign Doctor to Care Team
        </button>
      </div>

      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
        Active Care Team ({activeAssignments.length})
      </h4>

      <table className="clinical-table">
        <thead>
          <tr>
            <th>Doctor Name</th>
            <th>Role</th>
            <th>Specialization & Rank</th>
            <th>Department</th>
            <th>Primary Lead</th>
            <th>Assigned Date</th>
          </tr>
        </thead>
        <tbody>
          {activeAssignments.map((a) => (
            <tr key={a.id}>
              <td>
                <strong style={{ color: '#0f172a' }}>
                  Dr. {a.doctor.firstName} {a.doctor.lastName}
                </strong>
              </td>
              <td>
                <span className="author-role-tag" style={{ background: '#f1f5f9' }}>
                  {a.doctor.role.replace('_', ' ')}
                </span>
              </td>
              <td>{a.doctor.doctorProfile?.specialization || 'Clinical Doctor'}</td>
              <td>{a.doctor.doctorProfile?.department || 'Medical Services'}</td>
              <td>
                {a.isPrimary ? (
                  <span style={{ background: '#0284c7', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                    Lead Attending
                  </span>
                ) : (
                  <span style={{ color: '#94a3b8' }}>Care Team</span>
                )}
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                {new Date(a.assignedAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pastAssignments.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>
            Historical Care Team & Past Shifts ({pastAssignments.length})
          </h4>
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Role</th>
                <th>Assigned Date</th>
                <th>Unassigned Date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {pastAssignments.map((a) => (
                <tr key={a.id} style={{ opacity: 0.8 }}>
                  <td>Dr. {a.doctor.lastName}</td>
                  <td>{a.doctor.role.replace('_', ' ')}</td>
                  <td>{new Date(a.assignedAt).toLocaleDateString()}</td>
                  <td>{a.unassignedAt ? new Date(a.unassignedAt).toLocaleDateString() : 'N/A'}</td>
                  <td>{a.notes || 'Shift completed / handed over'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
