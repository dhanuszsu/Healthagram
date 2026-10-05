import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createEncounter,
  completeEncounter,
  getEncountersByPatient
} from './encounters.service.js';
import { sendSuccess } from '../../utils/response.js';
import { EncounterType } from '@prisma/client';

const createEncounterSchema = z.object({
  patientId: z.string().uuid(),
  type: z.nativeEnum(EncounterType),
  reason: z.string().min(2)
});

const completeEncounterSchema = z.object({
  outcome: z.string().min(2)
});

export async function createEncounterController(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = createEncounterSchema.parse(req.body);
    const encounter = await createEncounter({
      ...validated,
      createdById: req.user!.id
    });
    return sendSuccess(res, encounter, 'Encounter initiated', 201);
  } catch (error) {
    next(error);
  }
}

export async function completeEncounterController(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = completeEncounterSchema.parse(req.body);
    const encounterId = req.params.id as string;
    const updated = await completeEncounter({
      encounterId,
      outcome: validated.outcome,
      userId: req.user!.id
    });
    return sendSuccess(res, updated, 'Encounter completed');
  } catch (error) {
    next(error);
  }
}

export async function getPatientEncountersController(req: Request, res: Response, next: NextFunction) {
  try {
    const patientId = req.params.patientId as string;
    const encounters = await getEncountersByPatient(patientId);
    return sendSuccess(res, encounters, 'Patient encounters retrieved');
  } catch (error) {
    next(error);
  }
}
