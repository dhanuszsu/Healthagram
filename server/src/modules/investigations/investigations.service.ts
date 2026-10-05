import { prisma } from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { recordClinicalEvent } from '../../services/event.service.js';
import { recordAudit } from '../../services/audit.service.js';
import { notifyCareTeam } from '../../services/notification.service.js';
import { InvestigationType, PriorityLevel } from '@prisma/client';

export async function orderInvestigation(data: {
  patientId: string;
  encounterId?: string;
  orderedById: string;
  type: InvestigationType;
  title: string;
  clinicalIndication: string;
  priority?: PriorityLevel;
}) {
  const patient = await prisma.patient.findUnique({
    where: { id: data.patientId }
  });

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  const investigation = await prisma.investigation.create({
    data: {
      patientId: data.patientId,
      encounterId: data.encounterId,
      orderedById: data.orderedById,
      type: data.type,
      title: data.title,
      clinicalIndication: data.clinicalIndication,
      priority: data.priority || 'ROUTINE',
      status: 'ORDERED'
    },
    include: {
      orderedBy: {
        select: { id: true, firstName: true, lastName: true, role: true }
      }
    }
  });

  await recordClinicalEvent({
    patientId: data.patientId,
    encounterId: data.encounterId,
    eventType: 'INVESTIGATION_ORDERED',
    title: `Investigation Ordered: ${data.title} (${data.type})`,
    description: `Indication: "${data.clinicalIndication}". Priority: ${data.priority || 'ROUTINE'}. Ordered by Dr. ${investigation.orderedBy.lastName}.`,
    createdById: data.orderedById,
    metadata: {
      investigationId: investigation.id,
      type: data.type,
      priority: investigation.priority
    }
  });

  await recordAudit({
    userId: data.orderedById,
    patientId: data.patientId,
    action: 'ORDER_INVESTIGATION',
    entity: 'Investigation',
    entityId: investigation.id,
    details: { title: data.title, type: data.type, priority: investigation.priority }
  });

  return investigation;
}

export async function recordInvestigationResult(data: {
  investigationId: string;
  reportedById: string;
  findings: string;
  values?: Record<string, unknown> | string;
  impressions?: string;
}) {
  const investigation = await prisma.investigation.findUnique({
    where: { id: data.investigationId },
    include: { patient: true, orderedBy: true }
  });

  if (!investigation) {
    throw new AppError('Investigation not found', 404);
  }

  const valuesStr = data.values
    ? typeof data.values === 'string'
      ? data.values
      : JSON.stringify(data.values)
    : null;

  const result = await prisma.investigationResult.create({
    data: {
      investigationId: data.investigationId,
      reportedById: data.reportedById,
      findings: data.findings,
      values: valuesStr,
      impressions: data.impressions,
      status: 'FINAL'
    },
    include: {
      reportedBy: {
        select: { id: true, firstName: true, lastName: true, role: true }
      }
    }
  });

  // Update investigation status
  await prisma.investigation.update({
    where: { id: data.investigationId },
    data: { status: 'COMPLETED' }
  });

  const eventType = investigation.type === 'LAB' ? 'LAB_RESULT' : 'IMAGING_RESULT';

  await recordClinicalEvent({
    patientId: investigation.patientId,
    encounterId: investigation.encounterId,
    eventType,
    title: `Result Available: ${investigation.title}`,
    description: `Findings: "${data.findings}". Impression: "${data.impressions || 'Normal'}". Reported by Dr. ${result.reportedBy?.lastName || 'Pathology'}.`,
    createdById: data.reportedById,
    metadata: {
      investigationId: investigation.id,
      resultId: result.id,
      findings: data.findings,
      impressions: data.impressions
    }
  });

  await notifyCareTeam({
    patientId: investigation.patientId,
    excludeUserId: data.reportedById,
    type: 'INVESTIGATION_RESULT',
    title: `Result Ready: ${investigation.title}`,
    message: `Result ready for ${investigation.patient.name}. Findings: ${data.findings}`,
    referenceId: result.id
  });

  await recordAudit({
    userId: data.reportedById,
    patientId: investigation.patientId,
    action: 'RECORD_INVESTIGATION_RESULT',
    entity: 'InvestigationResult',
    entityId: result.id,
    details: { investigationTitle: investigation.title, findings: data.findings }
  });

  return result;
}

export async function reviewInvestigationResult(data: {
  resultId: string;
  reviewedById: string;
  clinicalInterpretation?: string;
}) {
  const result = await prisma.investigationResult.findUnique({
    where: { id: data.resultId },
    include: {
      investigation: {
        include: { patient: true }
      }
    }
  });

  if (!result) {
    throw new AppError('Investigation result not found', 404);
  }

  const updatedResult = await prisma.investigationResult.update({
    where: { id: data.resultId },
    data: {
      status: 'REVIEWED',
      reviewedById: data.reviewedById,
      reviewedAt: new Date(),
      impressions: data.clinicalInterpretation || result.impressions
    },
    include: {
      reviewedBy: {
        select: { id: true, firstName: true, lastName: true, role: true }
      }
    }
  });

  await recordClinicalEvent({
    patientId: result.investigation.patientId,
    encounterId: result.investigation.encounterId,
    eventType: 'ASSESSMENT',
    title: `Investigation Reviewed: ${result.investigation.title}`,
    description: `Reviewed by Dr. ${updatedResult.reviewedBy?.lastName}. Interpretation: "${data.clinicalInterpretation || 'Acknowledged and integrated into care plan.'}".`,
    createdById: data.reviewedById,
    metadata: { resultId: result.id, interpretation: data.clinicalInterpretation }
  });

  await recordAudit({
    userId: data.reviewedById,
    patientId: result.investigation.patientId,
    action: 'REVIEW_INVESTIGATION_RESULT',
    entity: 'InvestigationResult',
    entityId: result.id,
    details: { interpretation: data.clinicalInterpretation }
  });

  return updatedResult;
}

export async function getPatientInvestigations(patientId: string) {
  return prisma.investigation.findMany({
    where: { patientId },
    orderBy: { orderedAt: 'desc' },
    include: {
      orderedBy: {
        select: { id: true, firstName: true, lastName: true, role: true }
      },
      results: {
        include: {
          reportedBy: {
            select: { id: true, firstName: true, lastName: true, role: true }
          },
          reviewedBy: {
            select: { id: true, firstName: true, lastName: true, role: true }
          }
        }
      }
    }
  });
}
