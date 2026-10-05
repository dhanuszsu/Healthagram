export type UserRole = 'JUNIOR_DOCTOR' | 'SENIOR_DOCTOR' | 'SPECIALIST' | 'ADMIN';

export type EncounterType = 'EMERGENCY' | 'OUTPATIENT' | 'INPATIENT' | 'FOLLOW_UP' | 'CONSULTATION';
export type EncounterStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type ClinicalEventType =
  | 'ASSESSMENT'
  | 'CLINICAL_NOTE'
  | 'DIAGNOSIS'
  | 'VITAL_RECORDED'
  | 'PRESCRIPTION'
  | 'MEDICATION_ADMINISTERED'
  | 'MEDICATION_CHANGED'
  | 'MEDICATION_STOPPED'
  | 'INVESTIGATION_ORDERED'
  | 'LAB_RESULT'
  | 'IMAGING_RESULT'
  | 'SPECIALIST_REFERRAL'
  | 'SPECIALIST_REVIEW'
  | 'TREATMENT_CHANGE'
  | 'SENIOR_INSTRUCTION'
  | 'FOLLOW_UP'
  | 'HANDOVER'
  | 'DISCHARGE';

export type PrescriptionStatus = 'ACTIVE' | 'CHANGED' | 'STOPPED' | 'COMPLETED';
export type AdministrationStatus = 'GIVEN' | 'REFUSED' | 'HELD' | 'MISSED';
export type InvestigationType = 'LAB' | 'IMAGING' | 'OTHER';
export type InvestigationStatus = 'ORDERED' | 'SAMPLE_COLLECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type PriorityLevel = 'ROUTINE' | 'URGENT' | 'STAT';
export type ReferralStatus = 'PENDING' | 'ACCEPTED' | 'IN_REVIEW' | 'COMPLETED' | 'FOLLOW_UP';

export interface DoctorProfile {
  id: string;
  specialization: string;
  department: string;
  rank: string;
  licenseNumber: string;
  pagerOrPhone?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  doctorProfile?: DoctorProfile;
}

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  contact: string;
  allergies?: string;
  medicalHistory?: string;
  createdAt: string;
  updatedAt: string;
  encounters?: Encounter[];
  patientAssignments?: PatientAssignment[];
  prescriptions?: Prescription[];
  investigations?: Investigation[];
  specialistReferrals?: SpecialistReferral[];
  clinicalCommunications?: ClinicalCommunication[];
  seniorApproaches?: SeniorApproach[];
  _count?: {
    clinicalEvents: number;
    prescriptions: number;
    investigations: number;
    specialistReferrals: number;
  };
}

export interface Encounter {
  id: string;
  patientId: string;
  type: EncounterType;
  reason: string;
  status: EncounterStatus;
  startTime: string;
  endTime?: string;
  outcome?: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}

export interface ClinicalEvent {
  id: string;
  patientId: string;
  encounterId?: string;
  encounter?: {
    id: string;
    type: EncounterType;
    reason: string;
    status: EncounterStatus;
  };
  eventType: ClinicalEventType;
  title: string;
  description: string;
  createdAt: string;
  metadata?: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    doctorProfile?: {
      specialization: string;
      department?: string;
      rank: string;
    };
  };
}

export interface PatientAssignment {
  id: string;
  patientId: string;
  doctorId: string;
  role: UserRole;
  isPrimary: boolean;
  active: boolean;
  assignedAt: string;
  unassignedAt?: string;
  notes?: string;
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    doctorProfile?: {
      specialization: string;
      rank: string;
      department?: string;
    };
  };
}

export interface Prescription {
  id: string;
  patientId: string;
  encounterId?: string;
  prescribedById: string;
  medication: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  instructions?: string;
  status: PrescriptionStatus;
  previousPrescriptionId?: string;
  changeReason?: string;
  stoppedAt?: string;
  createdAt: string;
  prescribedBy: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
  changedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
  previousPrescription?: {
    id: string;
    medication: string;
    dosage: string;
    frequency: string;
    status: string;
  };
  administrations?: MedicationAdministration[];
}

export interface MedicationAdministration {
  id: string;
  prescriptionId: string;
  patientId: string;
  dose: string;
  status: AdministrationStatus;
  notes?: string;
  administeredAt: string;
  administeredBy: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
  prescription?: {
    medication: string;
    dosage: string;
  };
}

export interface Investigation {
  id: string;
  patientId: string;
  type: InvestigationType;
  title: string;
  clinicalIndication: string;
  priority: PriorityLevel;
  status: InvestigationStatus;
  orderedAt: string;
  orderedBy: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
  results?: InvestigationResult[];
}

export interface InvestigationResult {
  id: string;
  investigationId: string;
  findings: string;
  values?: string;
  impressions?: string;
  status: string;
  createdAt: string;
  reportedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
  reviewedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}

export interface SpecialistReferral {
  id: string;
  patientId: string;
  referringDoctorId: string;
  specialistId: string;
  reason: string;
  priority: PriorityLevel;
  status: ReferralStatus;
  recommendation?: string;
  recommendationAt?: string;
  createdAt: string;
  patient?: {
    id: string;
    name: string;
    mrn: string;
    age: number;
    gender: string;
    allergies?: string;
  };
  referringDoctor: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
  specialist: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    doctorProfile?: {
      specialization: string;
      rank: string;
    };
  };
}

export interface ClinicalCommunication {
  id: string;
  patientId: string;
  type: string;
  subject: string;
  content: string;
  priority: PriorityLevel;
  isAcknowledged: boolean;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    doctorProfile?: { specialization: string; rank: string };
  };
  receiver?: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}

export interface Notification {
  id: string;
  userId: string;
  patientId?: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  patient?: {
    id: string;
    name: string;
    mrn: string;
  };
}

export interface AuditLog {
  id: string;
  userId?: string;
  patientId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  timestamp: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}

export interface SeniorApproach {
  id: string;
  patientId: string;
  encounterId?: string;
  seniorDoctorId: string;
  title: string;
  situation: string;
  assessment: string;
  decision: string;
  treatmentApproach: string;
  reasoning?: string;
  outcome?: string;
  sharedAt: string;
  createdAt: string;
  patient: {
    id: string;
    name: string;
    mrn: string;
    age: number;
    gender: string;
    allergies?: string;
    medicalHistory?: string;
  };
  seniorDoctor: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    doctorProfile?: {
      specialization: string;
      rank: string;
      department?: string;
    };
  };
}

export interface WhatChangedData {
  patientId: string;
  lastViewedAt: string | null;
  since: string;
  recentEvents: ClinicalEvent[];
  recentPrescriptions: Prescription[];
  recentInvestigations: Investigation[];
  recentCommunications: ClinicalCommunication[];
  recentReferrals: SpecialistReferral[];
  totalChanges: number;
}
