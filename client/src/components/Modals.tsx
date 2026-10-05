import React, { useState } from 'react';
import { Prescription, Investigation, SpecialistReferral, User, Patient } from '../types';
import { X, CheckCircle2, RotateCw, AlertTriangle, Pill, Send, FilePlus, UserPlus } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. ADD CLINICAL EVENT MODAL
export const AddEventModal: React.FC<ModalProps & { onSubmit: (data: any) => Promise<void> }> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [eventType, setEventType] = useState('ASSESSMENT');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ eventType, title, description });
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">Record Clinical Event / Assessment</h3>
          <button onClick={onClose} className="btn-outline btn-sm"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Clinical Event Type</label>
              <select className="form-select" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                <option value="ASSESSMENT">Clinical Assessment / Bedside Review</option>
                <option value="CLINICAL_NOTE">Clinical Progress Note</option>
                <option value="VITAL_RECORDED">Vitals Recorded</option>
                <option value="SENIOR_INSTRUCTION">Senior Attending Instruction</option>
                <option value="FOLLOW_UP">Follow-Up Note</option>
                <option value="HANDOVER">Cross-Shift Handover</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input
                className="form-input"
                placeholder="e.g. Ward Round Review / Patient Re-assessment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Detailed Clinical Description</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Document subjective symptoms, physical examination, vitals, or clinical reasoning..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Record to Timeline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. NEW PRESCRIPTION MODAL
export const NewPrescriptionModal: React.FC<ModalProps & { onSubmit: (data: any) => Promise<void> }> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [route, setRoute] = useState('Oral');
  const [duration, setDuration] = useState('7 days');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ medication, dosage, frequency, route, duration, instructions });
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">Prescribe Medication</h3>
          <button onClick={onClose} className="btn-outline btn-sm"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Medication Name</label>
              <input
                className="form-input"
                placeholder="e.g. Bisoprolol, Amoxicillin, Diltiazem"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Dosage</label>
                <input
                  className="form-input"
                  placeholder="e.g. 25 mg, 500 mg"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <input
                  className="form-input"
                  placeholder="e.g. Twice daily, Once at night"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Route</label>
                <select className="form-select" value={route} onChange={(e) => setRoute(e.target.value)}>
                  <option value="Oral">Oral</option>
                  <option value="IV">Intravenous (IV)</option>
                  <option value="IM">Intramuscular (IM)</option>
                  <option value="Subcutaneous">Subcutaneous</option>
                  <option value="Inhaled">Inhaled</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <input
                  className="form-input"
                  placeholder="e.g. 5 days, Ongoing"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Special Clinical Instructions (Optional)</label>
              <input
                className="form-input"
                placeholder="e.g. Take with food. Hold if HR < 55 bpm."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Prescribing...' : 'Sign & Prescribe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. CHANGE PRESCRIPTION MODAL
export const ChangePrescriptionModal: React.FC<ModalProps & {
  prescription: Prescription | null;
  onSubmit: (id: string, data: any) => Promise<void>;
}> = ({ isOpen, onClose, prescription, onSubmit }) => {
  const [changeReason, setChangeReason] = useState('');
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Twice daily');
  const [route, setRoute] = useState('Oral');
  const [duration, setDuration] = useState('7 days');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !prescription) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(prescription.id, {
        changeReason,
        medication,
        dosage,
        frequency,
        route,
        duration,
        instructions
      });
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <RotateCw size={18} color="#d97706" />
            <h3 className="modal-title">Change Treatment Regimen</h3>
          </div>
          <button onClick={onClose} className="btn-outline btn-sm"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.825rem' }}>
              <strong>Current Regimen to be Discontinued:</strong>
              <div>{prescription.medication} {prescription.dosage} ({prescription.frequency})</div>
              <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.2rem' }}>
                * Lineage will be preserved in timeline and audit trail.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#b45309' }}>
                * Mandatory Clinical Reason for Modification
              </label>
              <input
                className="form-input"
                placeholder="e.g. Airway reactivity; switched per Cardiology Specialist recommendation"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                required
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0' }} />

            <div className="form-group">
              <label className="form-label">New Medication Name</label>
              <input
                className="form-input"
                placeholder="e.g. Diltiazem Hydrochloride"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">New Dosage</label>
                <input
                  className="form-input"
                  placeholder="e.g. 60 mg"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <input
                  className="form-input"
                  placeholder="e.g. Twice daily"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Route</label>
                <input
                  className="form-input"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <input
                  className="form-input"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Instructions (Optional)</label>
              <input
                className="form-input"
                placeholder="e.g. Hold if HR < 60 bpm."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ background: '#d97706' }} disabled={submitting}>
              {submitting ? 'Applying Change...' : 'Apply Treatment Change'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. ADMINISTER MEDICATION MODAL
export const AdministerModal: React.FC<ModalProps & {
  prescription: Prescription | null;
  onSubmit: (id: string, data: any) => Promise<void>;
}> = ({ isOpen, onClose, prescription, onSubmit }) => {
  const [dose, setDose] = useState('');
  const [status, setStatus] = useState('GIVEN');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (prescription) {
      setDose(`${prescription.dosage} ${prescription.route}`);
    }
  }, [prescription]);

  if (!isOpen || !prescription) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(prescription.id, { dose, status, notes });
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={18} color="#059669" />
            <h3 className="modal-title">Record Medication Administration</h3>
          </div>
          <button onClick={onClose} className="btn-outline btn-sm"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.85rem' }}>
              <strong>Prescribed Medication:</strong> {prescription.medication} ({prescription.dosage})
              <div style={{ fontSize: '0.75rem', color: '#065f46' }}>
                Instructions: {prescription.instructions || 'Standard administration'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Dose Administered</label>
              <input
                className="form-input"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Administration Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="GIVEN">GIVEN (Successfully Administered)</option>
                <option value="REFUSED">REFUSED (Patient Refused)</option>
                <option value="HELD">HELD (Clinical Hold / Withheld)</option>
                <option value="MISSED">MISSED</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Notes / Pre-Administration Observations</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Pre-dose HR: 88 bpm, BP: 124/80. Ingested without difficulty."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ background: '#059669' }} disabled={submitting}>
              {submitting ? 'Recording...' : 'Confirm Administration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 5. ORDER INVESTIGATION MODAL
export const OrderInvestigationModal: React.FC<ModalProps & { onSubmit: (data: any) => Promise<void> }> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [type, setType] = useState('LAB');
  const [title, setTitle] = useState('');
  const [clinicalIndication, setClinicalIndication] = useState('');
  const [priority, setPriority] = useState('ROUTINE');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ type, title, clinicalIndication, priority });
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">Order Diagnostic Investigation</h3>
          <button onClick={onClose} className="btn-outline btn-sm"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Investigation Type</label>
                <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="LAB">Laboratory / Blood Test</option>
                  <option value="IMAGING">Diagnostic Imaging (X-Ray, CT, MRI, Echo)</option>
                  <option value="OTHER">Other Diagnostic Procedure</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent</option>
                  <option value="STAT">STAT (Immediate Emergency)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Test Title / Diagnostic Order</label>
              <input
                className="form-input"
                placeholder="e.g. High-Sensitivity Troponin I, 12-Lead ECG, 24h Holter"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Indication & Specific Questions</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Exclude acute myocardial injury in new-onset rapid AFib..."
                value={clinicalIndication}
                onChange={(e) => setClinicalIndication(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Ordering...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 6. RECORD INVESTIGATION RESULT MODAL
export const RecordResultModal: React.FC<ModalProps & {
  investigation: Investigation | null;
  onSubmit: (id: string, data: any) => Promise<void>;
}> = ({ isOpen, onClose, investigation, onSubmit }) => {
  const [findings, setFindings] = useState('');
  const [impressions, setImpressions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !investigation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(investigation.id, { findings, impressions });
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">Record Investigation Result: {investigation.title}</h3>
          <button onClick={onClose} className="btn-outline btn-sm"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Findings & Values</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Troponin I: 12 ng/L (Normal < 14). Potassium: 4.1 mmol/L."
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Clinical Impression / Interpretation</label>
              <input
                className="form-input"
                placeholder="e.g. No biomarker evidence of acute ischemia."
                value={impressions}
                onChange={(e) => setImpressions(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Recording...' : 'Save & Publish Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 7. CREATE SPECIALIST REFERRAL MODAL
export const CreateReferralModal: React.FC<ModalProps & {
  doctors: User[];
  onSubmit: (data: any) => Promise<void>;
}> = ({ isOpen, onClose, doctors, onSubmit }) => {
  const specialists = doctors.filter((d) => d.role === 'SPECIALIST');
  const [specialistId, setSpecialistId] = useState(specialists[0]?.id || '');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState('ROUTINE');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ specialistId: specialistId || specialists[0]?.id, reason, priority });
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">Request Specialist Referral</h3>
          <button onClick={onClose} className="btn-outline btn-sm"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Consulting Specialist</label>
              <select
                className="form-select"
                value={specialistId}
                onChange={(e) => setSpecialistId(e.target.value)}
                required
              >
                {specialists.map((s) => (
                  <option key={s.id} value={s.id}>
                    Dr. {s.firstName} {s.lastName} — {s.doctorProfile?.specialization || 'Specialist'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="ROUTINE">Routine</option>
                <option value="URGENT">Urgent</option>
                <option value="STAT">STAT (Emergency)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Reason & Specific Consultation Question</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Explain the clinical dilemma, current regimen, and expert opinion requested..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ background: '#7c3aed' }} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Send Referral Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 8. RESPOND TO REFERRAL MODAL (FOR SPECIALIST)
export const RespondReferralModal: React.FC<ModalProps & {
  referral: SpecialistReferral | null;
  onSubmit: (id: string, recommendation: string) => Promise<void>;
}> = ({ isOpen, onClose, referral, onSubmit }) => {
  const [recommendation, setRecommendation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !referral) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(referral.id, recommendation);
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">Specialist Consultation Recommendation</h3>
          <button onClick={onClose} className="btn-outline btn-sm"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.85rem' }}>
              <strong>Referral Reason from Dr. {referral.referringDoctor.lastName}:</strong>
              <div>"{referral.reason}"</div>
            </div>

            <div className="form-group">
              <label className="form-label">Specialist Assessment & Actionable Recommendation</label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="Provide clinical diagnosis, medication adjustments, suggested investigations, or intervention advice..."
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ background: '#7c3aed' }} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Specialist Opinion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 9. CREATE CLINICAL COMMUNICATION MODAL
export const CreateCommunicationModal: React.FC<ModalProps & {
  doctors: User[];
  onSubmit: (data: any) => Promise<void>;
}> = ({ isOpen, onClose, doctors, onSubmit }) => {
  const [receiverId, setReceiverId] = useState('');
  const [type, setType] = useState('SENIOR_INSTRUCTION');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('ROUTINE');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        receiverId: receiverId ? receiverId : undefined,
        type,
        subject,
        content,
        priority
      });
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">New Patient-Linked Clinical Communication</h3>
          <button onClick={onClose} className="btn-outline btn-sm"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Communication Type</label>
                <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="SENIOR_INSTRUCTION">Senior Instruction</option>
                  <option value="SPECIALIST_RECOMMENDATION">Specialist Recommendation</option>
                  <option value="IMPORTANT_OBSERVATION">Important Clinical Observation</option>
                  <option value="MEDICATION_UPDATE">Medication Update</option>
                  <option value="HANDOVER">Handover Note</option>
                  <option value="CLINICAL_NOTE">Clinical Note</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Recipient Doctor (or entire care team)</label>
                <select className="form-select" value={receiverId} onChange={(e) => setReceiverId(e.target.value)}>
                  <option value="">Broadcast to Entire Care Team</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.firstName} {d.lastName} ({d.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                className="form-input"
                placeholder="e.g. Check telemetry in 45 mins; monitor for bronchospasm"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Content / Instructions</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Write specific clinical instruction or observation..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Communication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 10. SHARE SENIOR APPROACH MODAL
export const ShareSeniorApproachModal: React.FC<
  ModalProps & {
    patient: Patient | null;
    onSubmit: (data: any) => Promise<void>;
  }
> = ({ isOpen, onClose, patient, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [situation, setSituation] = useState('');
  const [assessment, setAssessment] = useState('');
  const [decision, setDecision] = useState('');
  const [treatmentApproach, setTreatmentApproach] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [outcome, setOutcome] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !patient) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const activeEncounter = patient.encounters?.find((enc) => enc.status === 'ACTIVE');
      await onSubmit({
        patientId: patient.id,
        encounterId: activeEncounter?.id,
        title,
        situation,
        assessment,
        decision,
        treatmentApproach,
        reasoning,
        outcome
      });
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Share Senior Approach</h3>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
              Real case clinical knowledge layer for: <strong>{patient.name}</strong> ({patient.mrn})
            </div>
          </div>
          <button onClick={onClose} className="btn-outline btn-sm"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#475569', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
              <strong>Clinical Knowledge Layer:</strong> This does not alter or duplicate the clinical record. It captures how you approached this real case so junior colleagues can understand the clinical decision pathway.
            </div>

            <div className="form-group">
              <label className="form-label">Case Title / Topic *</label>
              <input
                className="form-input"
                placeholder="e.g. Acute Rate Control in Atrial Fibrillation with Underlying Airway Reactivity"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Situation (Optional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="What was the presentation, vital signs, or clinical dilemma when you reviewed the patient?"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Senior Assessment (Optional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="What was your clinical reading of the underlying risks or contraindications?"
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Senior Decision *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="What immediate decision or shift in strategy did you take?"
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Treatment / Prescribing Approach (Optional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Specific drug selection, dosing logic, or alternatives chosen..."
                value={treatmentApproach}
                onChange={(e) => setTreatmentApproach(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Reasoning (Optional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Why was this pathway chosen over the standard protocol?"
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Outcome / Follow-up (Optional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Did the patient stabilize? What is the subsequent plan?"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ background: '#4f46e5', borderColor: '#4f46e5' }} disabled={submitting}>
              {submitting ? 'Publishing Approach...' : 'Share Senior Approach'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

