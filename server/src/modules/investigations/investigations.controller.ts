import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  orderInvestigation,
  recordInvestigationResult,
  reviewInvestigationResult,
  getPatientInvestigations
} from './investigations.service.js';
import { sendSuccess } from '../../utils/response.js';
import { InvestigationType, PriorityLevel } from '@prisma/client';

const orderSchema = z.object({
  patientId: z.string().uuid(),
  encounterId: z.string().uuid().optional(),
  type: z.nativeEnum(InvestigationType),
  title: z.string().min(2),
  clinicalIndication: z.string().min(2),
  priority: z.nativeEnum(PriorityLevel).optional()
});

const resultSchema = z.object({
  findings: z.string().min(2),
  values: z.union([z.string(), z.record(z.unknown())]).optional(),
  impressions: z.string().optional()
});

const reviewSchema = z.object({
  clinicalInterpretation: z.string().optional()
});

export async function orderInvestigationController(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = orderSchema.parse(req.body);
    const investigation = await orderInvestigation({
      ...validated,
      orderedById: req.user!.id
    });
    return sendSuccess(res, investigation, 'Investigation ordered', 201);
  } catch (error) {
    next(error);
  }
}

export async function recordResultController(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = resultSchema.parse(req.body);
    const investigationId = req.params.id as string;
    const result = await recordInvestigationResult({
      investigationId,
      reportedById: req.user!.id,
      ...validated
    });
    return sendSuccess(res, result, 'Investigation result recorded', 201);
  } catch (error) {
    next(error);
  }
}

export async function reviewResultController(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = reviewSchema.parse(req.body);
    const resultId = req.params.resultId as string;
    const reviewed = await reviewInvestigationResult({
      resultId,
      reviewedById: req.user!.id,
      clinicalInterpretation: validated.clinicalInterpretation
    });
    return sendSuccess(res, reviewed, 'Investigation result marked as reviewed');
  } catch (error) {
    next(error);
  }
}

export async function getPatientInvestigationsController(req: Request, res: Response, next: NextFunction) {
  try {
    const patientId = req.params.patientId as string;
    const investigations = await getPatientInvestigations(patientId);
    return sendSuccess(res, investigations, 'Patient investigations retrieved');
  } catch (error) {
    next(error);
  }
}
