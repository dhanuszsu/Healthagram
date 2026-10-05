import { prisma } from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { recordClinicalEvent } from '../../services/event.service.js';
import { recordAudit } from '../../services/audit.service.js';
import { createNotification, notifyCareTeam } from '../../services/notification.service.js';
import { PriorityLevel, ReferralStatus } from '@prisma/client';

export async function createSpecialistReferral(data: {
  patientId: string;
  encounterId?: string;
  referringDoctorId: string;
  specialistId: string;
  reason: string;
  priority?: PriorityLevel;
}) {
  const patient = await prisma.patient.findUnique({
    where: { id: data.patientId }
  });

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  const specialist = await prisma.user.findUnique({
    where: { id: data.specialistId },
    include: { doctorProfile: true }
  });

  if (!specialist || specialist.role !== 'SPECIALIST') {
    throw new AppError('Target doctor is not registered as a Specialist', 400);
  }

  const referral = await prisma.specialistReferral.create({
    data: {
      patientId: data.patientId,
      encounterId: data.encounterId,
      referringDoctorId: data.referringDoctorId,
      specialistId: data.specialistId,
      reason: data.reason,
      priority: data.priority || 'ROUTINE',
      status: 'PENDING'
    },
    include: {
      referringDoctor: {
        select: { id: true, firstName: true, lastName: true, role: true }
      },
      specialist: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          doctorProfile: { select: { specialization: true, rank: true } }
        }
      }
    }
  });

  // Assign specialist to patient care team automatically if not already assigned
  const existingAssignment = await prisma.patientAssignment.findFirst({
    where: {
      patientId: data.patientId,
      doctorId: data.specialistId,
      active: true
    }
  });

  if (!existingAssignment) {
    await prisma.patientAssignment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.specialistId,
        role: 'SPECIALIST',
        isPrimary: false,
        notes: `Consultation requested for ${specialist.doctorProfile?.specialization || 'Specialty'}`
      }
    });
  }

  // Record Clinical Event on shared timeline
  await recordClinicalEvent({
    patientId: data.patientId,
    encounterId: data.encounterId,
    eventType: 'SPECIALIST_REFERRAL',
    title: `Specialist Referral: ${specialist.doctorProfile?.specialization || 'Consultant'}`,
    description: `Referred to Dr. ${specialist.firstName} ${specialist.lastName} (${specialist.doctorProfile?.specialization}). Reason: "${data.reason}". Priority: ${referral.priority}.`,
    createdById: data.referringDoctorId,
    metadata: {
      referralId: referral.id,
      specialistId: specialist.id,
      priority: referral.priority
    }
  });

  // Notify Specialist directly
  await createNotification({
    userId: data.specialistId,
    patientId: data.patientId,
    type: 'SPECIALIST_REFERRAL',
    title: `New Specialist Referral for ${patient.name}`,
    message: `Dr. ${referral.referringDoctor.lastName} requested consultation: "${data.reason}". Priority: ${referral.priority}`,
    referenceId: referral.id
  });

  await recordAudit({
    userId: data.referringDoctorId,
    patientId: data.patientId,
    action: 'CREATE_SPECIALIST_REFERRAL',
    entity: 'SpecialistReferral',
    entityId: referral.id,
    details: { specialistId: data.specialistId, reason: data.reason }
  });

  return referral;
}

export async function respondToSpecialistReferral(data: {
  referralId: string;
  specialistId: string;
  recommendation: string;
  status?: ReferralStatus;
}) {
  const referral = await prisma.specialistReferral.findUnique({
    where: { id: data.referralId },
    include: {
      patient: true,
      referringDoctor: true,
      specialist: {
        include: { doctorProfile: true }
      }
    }
  });

  if (!referral) {
    throw new AppError('Specialist referral not found', 404);
  }

  if (referral.specialistId !== data.specialistId) {
    throw new AppError('Only the assigned specialist can respond to this referral', 403);
  }

  const updatedReferral = await prisma.specialistReferral.update({
    where: { id: data.referralId },
    data: {
      recommendation: data.recommendation,
      recommendationAt: new Date(),
      status: data.status || 'COMPLETED'
    }
  });

  // Emit SPECIALIST_REVIEW event to timeline
  await recordClinicalEvent({
    patientId: referral.patientId,
    encounterId: referral.encounterId,
    eventType: 'SPECIALIST_REVIEW',
    title: `Specialist Review & Recommendation: Dr. ${referral.specialist.lastName}`,
    description: `Specialist Assessment (${referral.specialist.doctorProfile?.specialization}): "${data.recommendation}"`,
    createdById: data.specialistId,
    metadata: {
      referralId: referral.id,
      specialistId: referral.specialistId,
      status: updatedReferral.status
    }
  });

  // Notify referring doctor and care team
  await createNotification({
    userId: referral.referringDoctorId,
    patientId: referral.patientId,
    type: 'SPECIALIST_RECOMMENDATION',
    title: `Specialist Recommendation for ${referral.patient.name}`,
    message: `Dr. ${referral.specialist.lastName} provided recommendation: "${data.recommendation.substring(0, 100)}..."`,
    referenceId: referral.id
  });

  await notifyCareTeam({
    patientId: referral.patientId,
    excludeUserId: data.specialistId,
    type: 'SPECIALIST_RECOMMENDATION',
    title: `Specialist Recommendation for ${referral.patient.name}`,
    message: `Dr. ${referral.specialist.lastName} (${referral.specialist.doctorProfile?.specialization}): "${data.recommendation.substring(0, 80)}..."`,
    referenceId: referral.id
  });

  await recordAudit({
    userId: data.specialistId,
    patientId: referral.patientId,
    action: 'SPECIALIST_RECOMMENDATION_ADDED',
    entity: 'SpecialistReferral',
    entityId: referral.id,
    details: { recommendation: data.recommendation }
  });

  return updatedReferral;
}

export async function getReferralsByPatient(patientId: string) {
  return prisma.specialistReferral.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    include: {
      referringDoctor: {
        select: { id: true, firstName: true, lastName: true, role: true }
      },
      specialist: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          doctorProfile: { select: { specialization: true, rank: true } }
        }
      }
    }
  });
}

export async function getReferralsForSpecialist(specialistId: string) {
  return prisma.specialistReferral.findMany({
    where: { specialistId },
    orderBy: { createdAt: 'desc' },
    include: {
      patient: {
        select: { id: true, name: true, mrn: true, age: true, gender: true, allergies: true }
      },
      referringDoctor: {
        select: { id: true, firstName: true, lastName: true, role: true }
      }
    }
  });
}
