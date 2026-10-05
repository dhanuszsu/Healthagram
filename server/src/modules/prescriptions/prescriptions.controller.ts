import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  getPatientPrescriptions,
  createPrescription,
  changePrescription,
  stopPrescription,
  administerMedication,
  getPatientAdministrations
} from './prescriptions.service.js';
import { sendSuccess } from '../../utils/response.js';
import { AdministrationStatus } from '@prisma/client';

const createPrescriptionSchema = z.object({
  patientId: z.string().uuid(),
  encounterId: z.string().uuid().optional(),
  medication: z.string().min(2),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  route: z.string().min(1),
  duration: z.string().min(1),
  instructions: z.string().optional()
});

const changePrescriptionSchema = z.object({
  changeReason: z.string().min(3),
  medication: z.string().min(2),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  route: z.string().min(1),
  duration: z.string().min(1),
  instructions: z.string().optional()
});

const stopPrescriptionSchema = z.object({
  reason: z.string().min(3)
});

const administerSchema = z.object({
  dose: z.string().min(1),
  status: z.nativeEnum(AdministrationStatus).default(AdministrationStatus.GIVEN),
  notes: z.string().optional()
});

export async function getPatientPrescriptionsController(req: Request, res: Response, next: NextFunction) {
  try {
    const patientId = req.params.patientId as string;
    const prescriptions = await getPatientPrescriptions(patientId);
    return sendSuccess(res, prescriptions, 'Patient prescriptions retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createPrescriptionController(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = createPrescriptionSchema.parse(req.body);
    const prescription = await createPrescription({
      ...validated,
      prescribedById: req.user!.id
    });
    return sendSuccess(res, prescription, 'Prescription created', 201);
  } catch (error) {
    next(error);
  }
}

export async function changePrescriptionController(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = changePrescriptionSchema.parse(req.body);
    const prescriptionId = req.params.id as string;
    const newPrescription = await changePrescription({
      prescriptionId,
      changedById: req.user!.id,
      ...validated
    });
    return sendSuccess(res, newPrescription, 'Prescription changed and treatment history preserved');
  } catch (error) {
    next(error);
  }
}

export async function stopPrescriptionController(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = stopPrescriptionSchema.parse(req.body);
    const prescriptionId = req.params.id as string;
    const stopped = await stopPrescription({
      prescriptionId,
      stoppedById: req.user!.id,
      reason: validated.reason
    });
    return sendSuccess(res, stopped, 'Prescription discontinued');
  } catch (error) {
    next(error);
  }
}

export async function administerMedicationController(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = administerSchema.parse(req.body);
    const prescriptionId = req.params.id as string;
    const administration = await administerMedication({
      prescriptionId,
      administeredById: req.user!.id,
      dose: validated.dose,
      status: validated.status,
      notes: validated.notes
    });
    return sendSuccess(res, administration, 'Medication administration recorded', 201);
  } catch (error) {
    next(error);
  }
}

export async function getPatientAdministrationsController(req: Request, res: Response, next: NextFunction) {
  try {
    const patientId = req.params.patientId as string;
    const administrations = await getPatientAdministrations(patientId);
    return sendSuccess(res, administrations, 'Medication administrations retrieved');
  } catch (error) {
    next(error);
  }
}
