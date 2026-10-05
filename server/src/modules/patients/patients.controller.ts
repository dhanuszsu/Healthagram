import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  listPatients,
  getPatientById,
  createPatient,
  getPatientTimeline,
  addPatientClinicalEvent,
  getWhatChanged,
  markPatientViewed
} from './patients.service.js';
import { sendSuccess } from '../../utils/response.js';
import { ClinicalEventType } from '@prisma/client';

const createPatientSchema = z.object({
  name: z.string().min(2),
  mrn: z.string().min(2),
  dateOfBirth: z.string(),
  gender: z.string(),
  contact: z.string(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional()
});

const addEventSchema = z.object({
  encounterId: z.string().optional(),
  eventType: z.nativeEnum(ClinicalEventType),
  title: z.string().min(2),
  description: z.string().min(2),
  metadata: z.record(z.unknown()).optional()
});

export async function listPatientsController(req: Request, res: Response, next: NextFunction) {
  try {
    const search = req.query.search as string | undefined;
    const patients = await listPatients(search, req.user);
    return sendSuccess(res, patients, 'Patients retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getPatientController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const patient = await getPatientById(id, req.user);
    return sendSuccess(res, patient, 'Patient details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createPatientController(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = createPatientSchema.parse(req.body);
    const patient = await createPatient({
      ...validated,
      creatorId: req.user!.id
    });
    return sendSuccess(res, patient, 'Patient registered successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getTimelineController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const order = (req.query.order === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';
    const timeline = await getPatientTimeline(id, order);
    return sendSuccess(res, timeline, 'Patient timeline retrieved');
  } catch (error) {
    next(error);
  }
}

export async function addEventController(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = addEventSchema.parse(req.body);
    const id = req.params.id as string;
    const event = await addPatientClinicalEvent({
      patientId: id,
      encounterId: validated.encounterId,
      eventType: validated.eventType,
      title: validated.title,
      description: validated.description,
      createdById: req.user!.id,
      metadata: validated.metadata
    });
    return sendSuccess(res, event, 'Clinical event added to timeline', 201);
  } catch (error) {
    next(error);
  }
}

export async function getWhatChangedController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const updates = await getWhatChanged(id, req.user!.id);
    return sendSuccess(res, updates, 'Recent patient clinical changes retrieved');
  } catch (error) {
    next(error);
  }
}

export async function markViewedController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const viewRecord = await markPatientViewed(id, req.user!.id);
    return sendSuccess(res, viewRecord, 'Patient marked as viewed');
  } catch (error) {
    next(error);
  }
}

