import { Request } from 'express';
import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

interface AuditParams {
  userId?: string | null;
  patientId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown> | string | null;
  req?: Request;
}

export async function recordAudit(params: AuditParams) {
  try {
    const ipAddress = params.req ? (params.req.headers['x-forwarded-for'] as string) || params.req.ip : null;
    const userAgent = params.req ? (params.req.headers['user-agent'] as string) : null;
    const detailsStr = params.details
      ? typeof params.details === 'string'
        ? params.details
        : JSON.stringify(params.details)
      : null;

    const log = await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        patientId: params.patientId ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        details: detailsStr,
        ipAddress: ipAddress ?? undefined,
        userAgent: userAgent ?? undefined
      }
    });

    logger.info(`[Audit] ${params.action} on ${params.entity}:${params.entityId || 'N/A'} by user:${params.userId || 'system'}`);
    return log;
  } catch (error) {
    logger.error('Failed to write audit log:', error);
  }
}
