import { User, Patient, ClinicalEvent, Prescription, Investigation, SpecialistReferral, ClinicalCommunication, Notification, AuditLog } from './types';

const API_BASE = '/api';

export function getStoredToken(): string | null {
  return localStorage.getItem('healthagram_token');
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem('healthagram_token', token);
  } else {
    localStorage.removeItem('healthagram_token');
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return json.data;
}

export const api = {
  // Auth
  login: (email: string, passwordPlain: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: passwordPlain })
    }),
  getMe: () => request<User>('/auth/me'),
  getDoctors: () => request<User[]>('/auth/doctors'),

  // Patients
  getPatients: (search?: string) =>
    request<Patient[]>(`/patients${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getPatient: (id: string) => request<Patient>(`/patients/${id}`),
  getTimeline: (patientId: string, order: 'asc' | 'desc' = 'asc') =>
    request<ClinicalEvent[]>(`/patients/${patientId}/timeline?order=${order}`),
  addClinicalEvent: (patientId: string, data: { eventType: string; title: string; description: string; metadata?: Record<string, unknown> }) =>
    request<ClinicalEvent>(`/patients/${patientId}/events`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Prescriptions & Administrations
  getPrescriptions: (patientId: string) =>
    request<Prescription[]>(`/prescriptions/patient/${patientId}`),
  createPrescription: (data: {
    patientId: string;
    medication: string;
    dosage: string;
    frequency: string;
    route: string;
    duration: string;
    instructions?: string;
  }) =>
    request<Prescription>('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  changePrescription: (
    id: string,
    data: {
      changeReason: string;
      medication: string;
      dosage: string;
      frequency: string;
      route: string;
      duration: string;
      instructions?: string;
    }
  ) =>
    request<Prescription>(`/prescriptions/${id}/change`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  stopPrescription: (id: string, reason: string) =>
    request<Prescription>(`/prescriptions/${id}/stop`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),
  administerMedication: (
    prescriptionId: string,
    data: { dose: string; status: string; notes?: string }
  ) =>
    request<any>(`/prescriptions/${prescriptionId}/administer`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Investigations
  getInvestigations: (patientId: string) =>
    request<Investigation[]>(`/investigations/patient/${patientId}`),
  orderInvestigation: (data: {
    patientId: string;
    type: string;
    title: string;
    clinicalIndication: string;
    priority?: string;
  }) =>
    request<Investigation>('/investigations', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  recordResult: (
    investigationId: string,
    data: { findings: string; values?: Record<string, unknown>; impressions?: string }
  ) =>
    request<any>(`/investigations/${investigationId}/results`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Referrals
  getReferrals: (patientId: string) =>
    request<SpecialistReferral[]>(`/referrals/patient/${patientId}`),
  getMyReferrals: () => request<SpecialistReferral[]>('/referrals/assigned-to-me'),
  createReferral: (data: { patientId: string; specialistId: string; reason: string; priority?: string }) =>
    request<SpecialistReferral>('/referrals', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  respondReferral: (id: string, data: { recommendation: string; status?: string }) =>
    request<SpecialistReferral>(`/referrals/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Care Team
  getCareTeam: (patientId: string) => request<any[]>(`/care-team/patient/${patientId}`),
  assignDoctor: (data: { patientId: string; doctorId: string; isPrimary?: boolean; notes?: string }) =>
    request<any>('/care-team', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Communications
  getCommunications: (patientId: string) =>
    request<ClinicalCommunication[]>(`/communications/patient/${patientId}`),
  createCommunication: (data: {
    patientId: string;
    receiverId?: string;
    type: string;
    subject: string;
    content: string;
    priority?: string;
  }) =>
    request<ClinicalCommunication>('/communications', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Notifications & Audit
  getNotifications: () => request<Notification[]>('/notifications'),
  markNotificationRead: (id: string) => request<Notification>(`/notifications/${id}/read`, { method: 'PATCH' }),
  getPatientAuditLogs: (patientId: string) => request<AuditLog[]>(`/audit/patient/${patientId}`),

  // What Changed & Patient View Audit
  getWhatChanged: (patientId: string) => request<any>(`/patients/${patientId}/what-changed`),
  markPatientViewed: (patientId: string) => request<any>(`/patients/${patientId}/mark-viewed`, { method: 'POST' }),

  // Senior Approach
  listSeniorApproaches: () => request<any[]>('/senior-approach'),
  getSeniorApproach: (id: string) => request<any>(`/senior-approach/${id}`),
  createSeniorApproach: (data: {
    patientId: string;
    encounterId?: string;
    title: string;
    situation: string;
    assessment: string;
    decision: string;
    treatmentApproach: string;
    reasoning?: string;
    outcome?: string;
  }) =>
    request<any>('/senior-approach', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};
