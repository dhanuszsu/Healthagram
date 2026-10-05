import { Router } from 'express';
import {
  createEncounterController,
  completeEncounterController,
  getPatientEncountersController
} from './encounters.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const encountersRouter = Router();

encountersRouter.use(authenticate);

encountersRouter.post('/', createEncounterController);
encountersRouter.patch('/:id/complete', completeEncounterController);
encountersRouter.get('/patient/:patientId', getPatientEncountersController);
