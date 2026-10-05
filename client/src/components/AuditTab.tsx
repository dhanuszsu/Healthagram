import React from 'react';
import { AuditLog } from '../types';
import { ShieldCheck, Clock } from 'lucide-react';

interface AuditTabProps {
  logs: AuditLog[];
}

export const AuditTab: React.FC<AuditTabProps> = ({ logs }) => {
  return (
    <div className="tab-panel">
      <div className="panel-action-bar">
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
            <ShieldCheck size={16} color="#059669" />
            Clinical Audit Trail
          </h3>
        </div>
      </div>

      <table className="clinical-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action</th>
            <th>Clinical Entity</th>
            <th>Performed By</th>
            <th>Audit Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.775rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                <Clock size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    background: '#f1f5f9',
                    color: '#1e293b'
                  }}
                >
                  {log.action}
                </span>
              </td>
              <td style={{ color: '#0284c7', fontWeight: 600, fontSize: '0.8rem' }}>{log.entity}</td>
              <td>
                {log.user ? (
                  <span>
                    Dr. {log.user.lastName}{' '}
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      ({log.user.role.replace('_', ' ')})
                    </span>
                  </span>
                ) : (
                  <span style={{ color: '#94a3b8' }}>System Engine</span>
                )}
              </td>
              <td style={{ fontSize: '0.775rem', color: '#475569', maxWidth: '380px' }}>
                {log.details ? (
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{log.details}</span>
                ) : (
                  <span style={{ color: '#94a3b8' }}>N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
