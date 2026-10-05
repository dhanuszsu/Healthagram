import { Router } from 'express';
import {
  listPatientsController,
  getPatientController,
  createPatientController,
  getTimelineController,
  addEventController,
  getWhatChangedController,
  markViewedController
} from './patients.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const patientsRouter = Router();

patientsRouter.use(authenticate);

patientsRouter.get('/', listPatientsController);
patientsRouter.post('/', createPatientController);
patientsRouter.get('/:id', getPatientController);
patientsRouter.get('/:id/timeline', getTimelineController);
patientsRouter.post('/:id/events', addEventController);
patientsRouter.get('/:id/what-changed', getWhatChangedController);
patientsRouter.post('/:id/mark-viewed', markViewedController);
