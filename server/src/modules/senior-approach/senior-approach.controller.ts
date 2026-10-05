import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  listSeniorApproaches,
  getSeniorApproachById,
  createSeniorApproach
} from './senior-approach.service.js';
import { sendSuccess } from '../../utils/response.js';

const createApproachSchema = z.object({
  patientId: z.string().uuid(),
  encounterId: z.string().uuid().optional(),
  title: z.string().min(3),
  situation: z.string().min(5),
  assessment: z.string().min(5),
  decision: z.string().min(3),
  treatmentApproach: z.string().min(3),
  reasoning: z.string().optional(),
  outcome: z.string().optional()
});

export async function listSeniorApproachesController(_req: Request, res: Response, next: NextFunction) {
  try {
    const approaches = await listSeniorApproaches();
    return sendSuccess(res, approaches, 'Senior Approach cases retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getSeniorApproachController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const approach = await getSeniorApproachById(id);
    return sendSuccess(res, approach, 'Senior Approach case details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createSeniorApproachController(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = createApproachSchema.parse(req.body);
    const approach = await createSeniorApproach({
      ...validated,
      seniorDoctorId: req.user!.id
    });
    return sendSuccess(res, approach, 'Senior Approach case shared successfully', 201);
  } catch (error) {
    next(error);
  }
}
