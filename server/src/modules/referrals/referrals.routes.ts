import { Router } from 'express';
import {
  createReferralController,
  respondReferralController,
  getPatientReferralsController,
  getMyReferralsController
} from './referrals.controller.js';
import { authenticate, authorizeRole } from '../../middleware/auth.js';

export const referralsRouter = Router();

referralsRouter.use(authenticate);

referralsRouter.get('/patient/:patientId', getPatientReferralsController);
referralsRouter.get('/assigned-to-me', authorizeRole('SPECIALIST'), getMyReferralsController);
referralsRouter.post('/', createReferralController);
referralsRouter.post('/:id/respond', authorizeRole('SPECIALIST'), respondReferralController);
