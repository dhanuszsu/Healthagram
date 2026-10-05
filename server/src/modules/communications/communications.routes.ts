import { Router } from 'express';
import {
  createCommunicationController,
  acknowledgeController,
  getPatientCommunicationsController
} from './communications.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const communicationsRouter = Router();

communicationsRouter.use(authenticate);

communicationsRouter.get('/patient/:patientId', getPatientCommunicationsController);
communicationsRouter.post('/', createCommunicationController);
communicationsRouter.patch('/:id/acknowledge', acknowledgeController);
