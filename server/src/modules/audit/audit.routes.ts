import { Router } from 'express';
import { getPatientAuditController, getAllAuditController } from './audit.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const auditRouter = Router();

auditRouter.use(authenticate);

auditRouter.get('/', getAllAuditController);
auditRouter.get('/patient/:patientId', getPatientAuditController);
