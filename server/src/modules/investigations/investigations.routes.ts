import { Router } from 'express';
import {
  orderInvestigationController,
  recordResultController,
  reviewResultController,
  getPatientInvestigationsController
} from './investigations.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const investigationsRouter = Router();

investigationsRouter.use(authenticate);

investigationsRouter.get('/patient/:patientId', getPatientInvestigationsController);
investigationsRouter.post('/', orderInvestigationController);
investigationsRouter.post('/:id/results', recordResultController);
investigationsRouter.patch('/results/:resultId/review', reviewResultController);
