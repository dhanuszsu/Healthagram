import { prisma } from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { recordClinicalEvent } from '../../services/event.service.js';
import { recordAudit } from '../../services/audit.service.js';
import { EncounterType } from '@prisma/client';

export async function createEncounter(data: {
  patientId: string;
  type: EncounterType;
  reason: string;
  createdById: string;
}) {
  const patient = await prisma.patient.findUnique({
    where: { id: data.patientId }
  });

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  const encounter = await prisma.encounter.create({
    data: {
      patientId: data.patientId,
      type: data.type,
      reason: data.reason,
      createdById: data.createdById
    },
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true, role: true }
      }
    }
  });

  await recordClinicalEvent({
    patientId: data.patientId,
    encounterId: encounter.id,
    eventType: 'ASSESSMENT',
    title: `Encounter Started: ${data.type}`,
    description: `Initiated ${data.type} encounter for reason: "${data.reason}".`,
    createdById: data.createdById,
    metadata: { encounterType: data.type, encounterId: encounter.id }
  });

  await recordAudit({
    userId: data.createdById,
    patientId: data.patientId,
    action: 'CREATE_ENCOUNTER',
    entity: 'Encounter',
    entityId: encounter.id,
    details: { type: data.type, reason: data.reason }
  });

  return encounter;
}

export async function completeEncounter(data: {
  encounterId: string;
  outcome: string;
  userId: string;
}) {
  const encounter = await prisma.encounter.findUnique({
    where: { id: data.encounterId }
  });

  if (!encounter) {
    throw new AppError('Encounter not found', 404);
  }

  const updated = await prisma.encounter.update({
    where: { id: data.encounterId },
    data: {
      status: 'COMPLETED',
      endTime: new Date(),
      outcome: data.outcome
    }
  });

  await recordClinicalEvent({
    patientId: encounter.patientId,
    encounterId: encounter.id,
    eventType: 'DISCHARGE',
    title: `Encounter Completed (${encounter.type})`,
    description: `Clinical encounter concluded. Outcome: ${data.outcome}`,
    createdById: data.userId,
    metadata: { outcome: data.outcome }
  });

  await recordAudit({
    userId: data.userId,
    patientId: encounter.patientId,
    action: 'COMPLETE_ENCOUNTER',
    entity: 'Encounter',
    entityId: encounter.id,
    details: { outcome: data.outcome }
  });

  return updated;
}

export async function getEncountersByPatient(patientId: string) {
  return prisma.encounter.findMany({
    where: { patientId },
    orderBy: { startTime: 'desc' },
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true, role: true }
      },
      _count: {
        select: {
          clinicalEvents: true,
          prescriptions: true,
          investigations: true,
          specialistReferrals: true
        }
      }
    }
  });
}
