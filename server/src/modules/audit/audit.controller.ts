import { Request, Response, NextFunction } from 'express';
import { getPatientAuditLogs, getAllAuditLogs } from './audit.service.js';
import { sendSuccess } from '../../utils/response.js';

export async function getPatientAuditController(req: Request, res: Response, next: NextFunction) {
  try {
    const patientId = req.params.patientId as string;
    const logs = await getPatientAuditLogs(patientId);
    return sendSuccess(res, logs, 'Patient clinical audit logs retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getAllAuditController(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const logs = await getAllAuditLogs(limit);
    return sendSuccess(res, logs, 'System clinical audit logs retrieved');
  } catch (error) {
    next(error);
  }
}
