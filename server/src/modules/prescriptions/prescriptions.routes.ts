import { Router } from 'express';
import {
  getPatientPrescriptionsController,
  createPrescriptionController,
  changePrescriptionController,
  stopPrescriptionController,
  administerMedicationController,
  getPatientAdministrationsController
} from './prescriptions.controller.js';
import { authenticate, authorizeRole } from '../../middleware/auth.js';

export const prescriptionsRouter = Router();

prescriptionsRouter.use(authenticate);

// View prescriptions for a patient
prescriptionsRouter.get('/patient/:patientId', getPatientPrescriptionsController);
prescriptionsRouter.get('/patient/:patientId/administrations', getPatientAdministrationsController);

// Prescribe medication (Senior Doctor or Specialist only)
prescriptionsRouter.post(
  '/',
  authorizeRole('SENIOR_DOCTOR', 'SPECIALIST'),
  createPrescriptionController
);

// Change prescription (Senior Doctor or Specialist only)
prescriptionsRouter.post(
  '/:id/change',
  authorizeRole('SENIOR_DOCTOR', 'SPECIALIST'),
  changePrescriptionController
);

// Stop prescription (Senior Doctor or Specialist only)
prescriptionsRouter.post(
  '/:id/stop',
  authorizeRole('SENIOR_DOCTOR', 'SPECIALIST'),
  stopPrescriptionController
);

// Administer medication (All clinical doctors, typically Junior Doctors on duty)
prescriptionsRouter.post('/:id/administer', administerMedicationController);
