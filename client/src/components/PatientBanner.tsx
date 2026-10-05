import React from 'react';
import { Patient, UserRole } from '../types';
import { AlertTriangle, UserCheck, HeartPulse, Clock, FileText } from 'lucide-react';

interface PatientBannerProps {
  patient: Patient;
  onOpenAddEvent: () => void;
  onOpenNewPrescription: () => void;
  currentUserRole?: UserRole;
}

export const PatientBanner: React.FC<PatientBannerProps> = ({
  patient,
  onOpenAddEvent,
  onOpenNewPrescription,
  currentUserRole
}) => {
  const activeEncounter = patient.encounters?.find((e) => e.status === 'ACTIVE') || patient.encounters?.[0];
  const activeCareTeam = patient.patientAssignments?.filter((a) => a.active) || [];

  return (
    <div className="patient-banner">
      <div className="patient-banner-top">
        <div className="patient-hero">
          <div className="patient-title-row">
            <h1 className="patient-title">{patient.name}</h1>
            <span className="patient-mrn-badge">{patient.mrn}</span>
            {activeEncounter && (
              <span
                style={{
                  background: '#e0f2fe',
                  color: '#0369a1',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                {activeEncounter.type} • {activeEncounter.status}
              </span>
            )}
          </div>

          <div className="patient-meta-row">
            <span><strong>Age:</strong> {patient.age} yrs</span>
            <span><strong>Gender:</strong> {patient.gender}</span>
            <span><strong>DOB:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
            <span><strong>Emergency Contact:</strong> {patient.contact}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={onOpenAddEvent}>
            <FileText size={16} /> Add Clinical Note / Assessment
          </button>
          <button className="btn btn-primary" onClick={onOpenNewPrescription}>
            <HeartPulse size={16} /> Prescribe Medication
          </button>
        </div>
      </div>

      {/* Allergies Alert Banner */}
      {patient.allergies && (
        <div className="allergy-alert">
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>KNOWN CLINICAL ALLERGIES:</strong> {patient.allergies}
          </div>
        </div>
      )}

      {/* Baseline Medical History */}
      {patient.medicalHistory && (
        <div style={{ fontSize: '0.825rem', color: '#475569', background: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>
          <strong style={{ color: '#0f172a' }}>Baseline Medical History:</strong> {patient.medicalHistory}
        </div>
      )}

      {/* Active Care Team Strip */}
      <div className="care-team-strip">
        <span style={{ fontWeight: 700, color: '#64748b' }}>Assigned Care Team:</span>
        {activeCareTeam.length === 0 ? (
          <span style={{ color: '#94a3b8' }}>No doctors currently assigned</span>
        ) : (
          activeCareTeam.map((assignment) => (
            <span key={assignment.id} className="team-chip">
              <UserCheck size={12} color="#0284c7" />
              <span>Dr. {assignment.doctor.lastName}</span>
              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>
                ({assignment.doctor.role.replace('_', ' ')})
              </span>
              {assignment.isPrimary && (
                <span style={{ background: '#0284c7', color: 'white', padding: '0.05rem 0.3rem', borderRadius: '4px', fontSize: '0.65rem' }}>
                  Lead
                </span>
              )}
            </span>
          ))
        )}
      </div>
    </div>
  );
};
