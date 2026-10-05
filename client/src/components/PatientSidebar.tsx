import React, { useState } from 'react';
import { Patient } from '../types';
import { Users, Search, UserCheck, AlertCircle } from 'lucide-react';

interface PatientSidebarProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onSelectPatient: (patientId: string) => void;
}

export const PatientSidebar: React.FC<PatientSidebarProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient
}) => {
  const [search, setSearch] = useState('');

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.mrn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="sidebar">
      <div className="panel-card">
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="#0284c7" />
            <span>Assigned Patients</span>
          </div>
          <span className="patient-mrn-badge">{patients.length} Active</span>
        </div>

        <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by name or MRN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem 0.4rem 2rem' }}
            />
            <Search
              size={14}
              style={{ position: 'absolute', left: '0.65rem', top: '0.65rem', color: '#94a3b8' }}
            />
          </div>
        </div>

        <div className="patient-list">
          {filtered.map((patient) => {
            const isSelected = patient.id === selectedPatientId;
            const activeEncounter = patient.encounters?.[0];
            const primaryDoctor = patient.patientAssignments?.find((a) => a.isPrimary)?.doctor;

            return (
              <div
                key={patient.id}
                className={`patient-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectPatient(patient.id)}
              >
                <div className="patient-header-line">
                  <span className="patient-name-text">{patient.name}</span>
                  <span className="patient-mrn-badge">{patient.mrn}</span>
                </div>

                <div className="patient-sub-line">
                  <span>{patient.age} yrs • {patient.gender}</span>
                  {activeEncounter && (
                    <span style={{ color: '#0284c7', fontWeight: 600 }}>
                      {activeEncounter.type}
                    </span>
                  )}
                </div>

                {patient.allergies && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#dc2626' }}>
                    <AlertCircle size={12} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {patient.allergies}
                    </span>
                  </div>
                )}

                {primaryDoctor && (
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Lead: Dr. {primaryDoctor.lastName} ({primaryDoctor.role === 'SENIOR_DOCTOR' ? 'Senior' : 'Doctor'})
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
