import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createSpecialistReferral,
  respondToSpecialistReferral,
  getReferralsByPatient,
  getReferralsForSpecialist
} from './referrals.service.js';
import { sendSuccess } from '../../utils/response.js';
import { PriorityLevel, ReferralStatus } from '@prisma/client';

const createReferralSchema = z.object({
  patientId: z.string().uuid(),
  encounterId: z.string().uuid().optional(),
  specialistId: z.string().uuid(),
  reason: z.string().min(3),
  priority: z.nativeEnum(PriorityLevel).optional()
});

const respondReferralSchema = z.object({
  recommendation: z.string().min(3),
  status: z.nativeEnum(ReferralStatus).optional()
});

export async function createReferralController(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = createReferralSchema.parse(req.body);
    const referral = await createSpecialistReferral({
      ...validated,
      referringDoctorId: req.user!.id
    });
    return sendSuccess(res, referral, 'Specialist referral created', 201);
  } catch (error) {
    next(error);
  }
}

export async function respondReferralController(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = respondReferralSchema.parse(req.body);
    const referralId = req.params.id as string;
    const updated = await respondToSpecialistReferral({
      referralId,
      specialistId: req.user!.id,
      recommendation: validated.recommendation,
      status: validated.status
    });
    return sendSuccess(res, updated, 'Specialist recommendation submitted');
  } catch (error) {
    next(error);
  }
}

export async function getPatientReferralsController(req: Request, res: Response, next: NextFunction) {
  try {
    const patientId = req.params.patientId as string;
    const referrals = await getReferralsByPatient(patientId);
    return sendSuccess(res, referrals, 'Patient referrals retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getMyReferralsController(req: Request, res: Response, next: NextFunction) {
  try {
    const referrals = await getReferralsForSpecialist(req.user!.id);
    return sendSuccess(res, referrals, 'Assigned referrals retrieved');
  } catch (error) {
    next(error);
  }
}
