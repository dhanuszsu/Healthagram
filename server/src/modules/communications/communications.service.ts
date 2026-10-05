import { prisma } from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { recordClinicalEvent } from '../../services/event.service.js';
import { recordAudit } from '../../services/audit.service.js';
import { createNotification, notifyCareTeam } from '../../services/notification.service.js';
import { CommunicationType, PriorityLevel, ClinicalEventType } from '@prisma/client';

export async function createClinicalCommunication(data: {
  patientId: string;
  encounterId?: string;
  senderId: string;
  receiverId?: string;
  type: CommunicationType;
  subject: string;
  content: string;
  priority?: PriorityLevel;
}) {
  const patient = await prisma.patient.findUnique({
    where: { id: data.patientId }
  });

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  const sender = await prisma.user.findUnique({
    where: { id: data.senderId },
    include: { doctorProfile: true }
  });

  const communication = await prisma.clinicalCommunication.create({
    data: {
      patientId: data.patientId,
      encounterId: data.encounterId,
      senderId: data.senderId,
      receiverId: data.receiverId,
      type: data.type,
      subject: data.subject,
      content: data.content,
      priority: data.priority || 'ROUTINE'
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          doctorProfile: { select: { specialization: true, rank: true } }
        }
      },
      receiver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true
        }
      }
    }
  });

  // Map structured communication types to Timeline clinical event types if clinically significant
  let mappedEventType: ClinicalEventType | null = null;
  if (data.type === 'SENIOR_INSTRUCTION') {
    mappedEventType = 'SENIOR_INSTRUCTION';
  } else if (data.type === 'SPECIALIST_RECOMMENDATION') {
    mappedEventType = 'SPECIALIST_REVIEW';
  } else if (data.type === 'HANDOVER') {
    mappedEventType = 'HANDOVER';
  } else if (data.type === 'FOLLOW_UP') {
    mappedEventType = 'FOLLOW_UP';
  } else if (data.type === 'IMPORTANT_OBSERVATION') {
    mappedEventType = 'ASSESSMENT';
  } else if (data.type === 'CLINICAL_NOTE') {
    mappedEventType = 'CLINICAL_NOTE';
  }

  if (mappedEventType) {
    await recordClinicalEvent({
      patientId: data.patientId,
      encounterId: data.encounterId,
      eventType: mappedEventType,
      title: `${data.type.replace('_', ' ')}: ${data.subject}`,
      description: data.content,
      createdById: data.senderId,
      metadata: {
        communicationId: communication.id,
        communicationType: data.type,
        receiverId: data.receiverId
      }
    });
  }

  // Targeted notification
  if (data.receiverId) {
    await createNotification({
      userId: data.receiverId,
      patientId: data.patientId,
      type: `COMMUNICATION_${data.type}`,
      title: `${data.type.replace('_', ' ')} from Dr. ${sender?.lastName}`,
      message: `${data.subject}: ${data.content.substring(0, 100)}...`,
      referenceId: communication.id
    });
  } else {
    // Care team broadcast
    await notifyCareTeam({
      patientId: data.patientId,
      excludeUserId: data.senderId,
      type: `COMMUNICATION_${data.type}`,
      title: `Care Note for ${patient.name} (${data.type.replace('_', ' ')})`,
      message: `${data.subject}: ${data.content.substring(0, 80)}...`,
      referenceId: communication.id
    });
  }

  await recordAudit({
    userId: data.senderId,
    patientId: data.patientId,
    action: `CLINICAL_COMMUNICATION_${data.type}`,
    entity: 'ClinicalCommunication',
    entityId: communication.id,
    details: { subject: data.subject, receiverId: data.receiverId }
  });

  return communication;
}

export async function acknowledgeCommunication(id: string, acknowledgingDoctorId: string) {
  const comm = await prisma.clinicalCommunication.findUnique({
    where: { id }
  });

  if (!comm) {
    throw new AppError('Clinical communication not found', 404);
  }

  const updated = await prisma.clinicalCommunication.update({
    where: { id },
    data: {
      isAcknowledged: true,
      acknowledgedAt: new Date()
    }
  });

  await recordAudit({
    userId: acknowledgingDoctorId,
    patientId: comm.patientId,
    action: 'ACKNOWLEDGE_COMMUNICATION',
    entity: 'ClinicalCommunication',
    entityId: id,
    details: { subject: comm.subject }
  });

  return updated;
}

export async function getPatientCommunications(patientId: string) {
  return prisma.clinicalCommunication.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          doctorProfile: { select: { specialization: true, rank: true } }
        }
      },
      receiver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true
        }
      }
    }
  });
}
