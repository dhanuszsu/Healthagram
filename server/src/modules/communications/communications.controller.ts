import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createClinicalCommunication,
  acknowledgeCommunication,
  getPatientCommunications
} from './communications.service.js';
import { sendSuccess } from '../../utils/response.js';
import { CommunicationType, PriorityLevel } from '@prisma/client';

const createCommSchema = z.object({
  patientId: z.string().uuid(),
  encounterId: z.string().uuid().optional(),
  receiverId: z.string().uuid().optional(),
  type: z.nativeEnum(CommunicationType),
  subject: z.string().min(2),
  content: z.string().min(2),
  priority: z.nativeEnum(PriorityLevel).optional()
});

export async function createCommunicationController(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = createCommSchema.parse(req.body);
    const comm = await createClinicalCommunication({
      ...validated,
      senderId: req.user!.id
    });
    return sendSuccess(res, comm, 'Clinical communication recorded', 201);
  } catch (error) {
    next(error);
  }
}

export async function acknowledgeController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const acknowledged = await acknowledgeCommunication(id, req.user!.id);
    return sendSuccess(res, acknowledged, 'Communication marked as acknowledged');
  } catch (error) {
    next(error);
  }
}

export async function getPatientCommunicationsController(req: Request, res: Response, next: NextFunction) {
  try {
    const patientId = req.params.patientId as string;
    const comms = await getPatientCommunications(patientId);
    return sendSuccess(res, comms, 'Patient communications retrieved');
  } catch (error) {
    next(error);
  }
}
