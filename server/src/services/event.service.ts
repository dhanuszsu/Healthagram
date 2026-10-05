import { ClinicalEventType } from '@prisma/client';
import { prisma } from '../config/db.js';
import { recordAudit } from './audit.service.js';
import { logger } from '../utils/logger.js';

export interface RecordEventParams {
  patientId: string;
  encounterId?: string | null;
  eventType: ClinicalEventType;
  title: string;
  description: string;
  createdById: string;
  metadata?: Record<string, unknown> | null;
}

export async function recordClinicalEvent(params: RecordEventParams) {
  try {
    const metadataStr = params.metadata ? JSON.stringify(params.metadata) : null;

    const event = await prisma.clinicalEvent.create({
      data: {
        patientId: params.patientId,
        encounterId: params.encounterId ?? null,
        eventType: params.eventType,
        title: params.title,
        description: params.description,
        createdById: params.createdById,
        metadata: metadataStr
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            doctorProfile: {
              select: {
                specialization: true,
                rank: true
              }
            }
          }
        }
      }
    });

    // Mirror to audit log automatically
    await recordAudit({
      userId: params.createdById,
      patientId: params.patientId,
      action: `CLINICAL_EVENT_${params.eventType}`,
      entity: 'ClinicalEvent',
      entityId: event.id,
      details: {
        title: params.title,
        eventType: params.eventType,
        encounterId: params.encounterId
      }
    });

    logger.info(`[Timeline Event] Patient ${params.patientId}: [${params.eventType}] ${params.title}`);
    return event;
  } catch (error) {
    logger.error('Failed to create clinical event:', error);
    throw error;
  }
}
