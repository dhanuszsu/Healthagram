import { Router } from 'express';
import {
  listSeniorApproachesController,
  getSeniorApproachController,
  createSeniorApproachController
} from './senior-approach.controller.js';
import { authenticate, authorizeRole } from '../../middleware/auth.js';

export const seniorApproachRouter = Router();

seniorApproachRouter.use(authenticate);

seniorApproachRouter.get('/', listSeniorApproachesController);
seniorApproachRouter.get('/:id', getSeniorApproachController);

// Only Senior Doctors can share Senior Approach entries
seniorApproachRouter.post(
  '/',
  authorizeRole('SENIOR_DOCTOR'),
  createSeniorApproachController
);
