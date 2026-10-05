import { Router } from 'express';
import {
  assignDoctorController,
  unassignDoctorController,
  getPatientCareTeamController
} from './care-team.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const careTeamRouter = Router();

careTeamRouter.use(authenticate);

careTeamRouter.get('/patient/:patientId', getPatientCareTeamController);
careTeamRouter.post('/', assignDoctorController);
careTeamRouter.delete('/:id', unassignDoctorController);
