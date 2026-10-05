import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  assignDoctorToPatient,
  unassignDoctorFromPatient,
  getPatientCareTeam
} from './care-team.service.js';
import { sendSuccess } from '../../utils/response.js';

const assignDoctorSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  isPrimary: z.boolean().optional(),
  notes: z.string().optional()
});

export async function assignDoctorController(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = assignDoctorSchema.parse(req.body);
    const assignment = await assignDoctorToPatient({
      ...validated,
      assignedByUserId: req.user!.id
    });
    return sendSuccess(res, assignment, 'Doctor assigned to care team', 201);
  } catch (error) {
    next(error);
  }
}

export async function unassignDoctorController(req: Request, res: Response, next: NextFunction) {
  try {
    const assignmentId = req.params.id as string;
    const updated = await unassignDoctorFromPatient(assignmentId, req.user!.id);
    return sendSuccess(res, updated, 'Doctor unassigned from care team');
  } catch (error) {
    next(error);
  }
}

export async function getPatientCareTeamController(req: Request, res: Response, next: NextFunction) {
  try {
    const patientId = req.params.patientId as string;
    const careTeam = await getPatientCareTeam(patientId);
    return sendSuccess(res, careTeam, 'Patient care team retrieved');
  } catch (error) {
    next(error);
  }
}
