import { prisma } from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { recordClinicalEvent } from '../../services/event.service.js';
import { recordAudit } from '../../services/audit.service.js';
import { notifyCareTeam } from '../../services/notification.service.js';
import { AdministrationStatus } from '@prisma/client';

export async function getPatientPrescriptions(patientId: string) {
  return prisma.prescription.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    include: {
      prescribedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          doctorProfile: { select: { specialization: true, rank: true } }
        }
      },
      changedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          doctorProfile: { select: { specialization: true, rank: true } }
        }
      },
      previousPrescription: {
        select: {
          id: true,
          medication: true,
          dosage: true,
          frequency: true,
          status: true,
          createdAt: true
        }
      },
      supersededBy: {
        select: {
          id: true,
          medication: true,
          dosage: true,
          frequency: true,
          status: true,
          createdAt: true
        }
      },
      administrations: {
        orderBy: { administeredAt: 'desc' },
        include: {
          administeredBy: {
            select: { id: true, firstName: true, lastName: true, role: true }
          }
        }
      }
    }
  });
}

export async function createPrescription(data: {
  patientId: string;
  encounterId?: string;
  prescribedById: string;
  medication: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  instructions?: string;
}) {
  const patient = await prisma.patient.findUnique({
    where: { id: data.patientId }
  });

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  const prescription = await prisma.prescription.create({
    data: {
      patientId: data.patientId,
      encounterId: data.encounterId,
      prescribedById: data.prescribedById,
      medication: data.medication,
      dosage: data.dosage,
      frequency: data.frequency,
      route: data.route,
      duration: data.duration,
      instructions: data.instructions,
      status: 'ACTIVE'
    },
    include: {
      prescribedBy: {
        select: { id: true, firstName: true, lastName: true, role: true }
      }
    }
  });

  await recordClinicalEvent({
    patientId: data.patientId,
    encounterId: data.encounterId,
    eventType: 'PRESCRIPTION',
    title: `Prescription Created: ${data.medication} ${data.dosage}`,
    description: `Prescribed ${data.medication} ${data.dosage} via ${data.route} (${data.frequency}) for ${data.duration}. Instructions: ${data.instructions || 'Standard'}.`,
    createdById: data.prescribedById,
    metadata: {
      prescriptionId: prescription.id,
      medication: data.medication,
      dosage: data.dosage,
      route: data.route,
      frequency: data.frequency
    }
  });

  await notifyCareTeam({
    patientId: data.patientId,
    excludeUserId: data.prescribedById,
    type: 'PRESCRIPTION_CREATED',
    title: `New Prescription for ${patient.name}`,
    message: `${prescription.prescribedBy.firstName} ${prescription.prescribedBy.lastName} prescribed ${data.medication} ${data.dosage} (${data.frequency}).`,
    referenceId: prescription.id
  });

  await recordAudit({
    userId: data.prescribedById,
    patientId: data.patientId,
    action: 'CREATE_PRESCRIPTION',
    entity: 'Prescription',
    entityId: prescription.id,
    details: { medication: data.medication, dosage: data.dosage }
  });

  return prescription;
}

export async function changePrescription(data: {
  prescriptionId: string;
  changedById: string;
  changeReason: string;
  medication: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  instructions?: string;
}) {
  const oldPrescription = await prisma.prescription.findUnique({
    where: { id: data.prescriptionId },
    include: { patient: true }
  });

  if (!oldPrescription) {
    throw new AppError('Existing prescription not found', 404);
  }

  if (oldPrescription.status !== 'ACTIVE') {
    throw new AppError(`Cannot change prescription with status '${oldPrescription.status}'`, 400);
  }

  // Transaction ensures atomicity of prescription change
  const result = await prisma.$transaction(async (tx) => {
    // 1. Mark existing prescription as CHANGED with audit reason and timestamp
    await tx.prescription.update({
      where: { id: oldPrescription.id },
      data: {
        status: 'CHANGED',
        stoppedAt: new Date(),
        changeReason: data.changeReason,
        changedById: data.changedById
      }
    });

    // 2. Create new prescription referencing old one
    const newPrescription = await tx.prescription.create({
      data: {
        patientId: oldPrescription.patientId,
        encounterId: oldPrescription.encounterId,
        prescribedById: data.changedById,
        medication: data.medication,
        dosage: data.dosage,
        frequency: data.frequency,
        route: data.route,
        duration: data.duration,
        instructions: data.instructions,
        status: 'ACTIVE',
        previousPrescriptionId: oldPrescription.id
      },
      include: {
        prescribedBy: {
          select: { id: true, firstName: true, lastName: true, role: true }
        }
      }
    });

    return newPrescription;
  });

  // 3. Emit MEDICATION_CHANGED event
  await recordClinicalEvent({
    patientId: oldPrescription.patientId,
    encounterId: oldPrescription.encounterId,
    eventType: 'MEDICATION_CHANGED',
    title: `Medication Changed: ${oldPrescription.medication} → ${data.medication}`,
    description: `Treatment adjusted. Discontinued: ${oldPrescription.medication} (${oldPrescription.dosage}). Initiated: ${data.medication} (${data.dosage}, ${data.frequency}). Clinical Reason: "${data.changeReason}".`,
    createdById: data.changedById,
    metadata: {
      oldPrescriptionId: oldPrescription.id,
      newPrescriptionId: result.id,
      oldMedication: oldPrescription.medication,
      newMedication: data.medication,
      changeReason: data.changeReason
    }
  });

  // 4. Emit TREATMENT_CHANGE event
  await recordClinicalEvent({
    patientId: oldPrescription.patientId,
    encounterId: oldPrescription.encounterId,
    eventType: 'TREATMENT_CHANGE',
    title: `Treatment Regimen Altered`,
    description: `Clinical regimen updated for ${oldPrescription.patient.name}. Reason: ${data.changeReason}.`,
    createdById: data.changedById,
    metadata: { newPrescriptionId: result.id, changeReason: data.changeReason }
  });

  // 5. Notify care team of crucial medication change
  await notifyCareTeam({
    patientId: oldPrescription.patientId,
    excludeUserId: data.changedById,
    type: 'MEDICATION_CHANGED',
    title: `Medication Changed for ${oldPrescription.patient.name}`,
    message: `Changed from ${oldPrescription.medication} to ${data.medication} ${data.dosage}. Reason: ${data.changeReason}`,
    referenceId: result.id
  });

  await recordAudit({
    userId: data.changedById,
    patientId: oldPrescription.patientId,
    action: 'CHANGE_PRESCRIPTION',
    entity: 'Prescription',
    entityId: result.id,
    details: {
      from: oldPrescription.medication,
      to: data.medication,
      reason: data.changeReason
    }
  });

  return result;
}

export async function stopPrescription(data: {
  prescriptionId: string;
  stoppedById: string;
  reason: string;
}) {
  const prescription = await prisma.prescription.findUnique({
    where: { id: data.prescriptionId },
    include: { patient: true }
  });

  if (!prescription) {
    throw new AppError('Prescription not found', 404);
  }

  const updated = await prisma.prescription.update({
    where: { id: data.prescriptionId },
    data: {
      status: 'STOPPED',
      stoppedAt: new Date(),
      changeReason: data.reason,
      changedById: data.stoppedById
    }
  });

  await recordClinicalEvent({
    patientId: prescription.patientId,
    encounterId: prescription.encounterId,
    eventType: 'MEDICATION_STOPPED',
    title: `Medication Discontinued: ${prescription.medication}`,
    description: `Discontinued ${prescription.medication} ${prescription.dosage}. Reason: "${data.reason}".`,
    createdById: data.stoppedById,
    metadata: { prescriptionId: prescription.id, reason: data.reason }
  });

  await notifyCareTeam({
    patientId: prescription.patientId,
    excludeUserId: data.stoppedById,
    type: 'MEDICATION_STOPPED',
    title: `Medication Stopped for ${prescription.patient.name}`,
    message: `${prescription.medication} discontinued. Reason: ${data.reason}`,
    referenceId: prescription.id
  });

  await recordAudit({
    userId: data.stoppedById,
    patientId: prescription.patientId,
    action: 'STOP_PRESCRIPTION',
    entity: 'Prescription',
    entityId: prescription.id,
    details: { reason: data.reason }
  });

  return updated;
}

export async function administerMedication(data: {
  prescriptionId: string;
  administeredById: string;
  dose: string;
  status: AdministrationStatus;
  notes?: string;
}) {
  const prescription = await prisma.prescription.findUnique({
    where: { id: data.prescriptionId },
    include: { patient: true }
  });

  if (!prescription) {
    throw new AppError('Prescription not found', 404);
  }

  const administration = await prisma.medicationAdministration.create({
    data: {
      prescriptionId: data.prescriptionId,
      patientId: prescription.patientId,
      administeredById: data.administeredById,
      dose: data.dose,
      status: data.status,
      notes: data.notes
    },
    include: {
      administeredBy: {
        select: { id: true, firstName: true, lastName: true, role: true }
      }
    }
  });

  await recordClinicalEvent({
    patientId: prescription.patientId,
    encounterId: prescription.encounterId,
    eventType: 'MEDICATION_ADMINISTERED',
    title: `Medication Administered: ${prescription.medication} (${data.dose})`,
    description: `Dose: ${data.dose}. Status: ${data.status}. Administered by ${administration.administeredBy.firstName} ${administration.administeredBy.lastName}. Notes: ${data.notes || 'None'}.`,
    createdById: data.administeredById,
    metadata: {
      administrationId: administration.id,
      prescriptionId: prescription.id,
      medication: prescription.medication,
      dose: data.dose,
      status: data.status
    }
  });

  await recordAudit({
    userId: data.administeredById,
    patientId: prescription.patientId,
    action: 'ADMINISTER_MEDICATION',
    entity: 'MedicationAdministration',
    entityId: administration.id,
    details: {
      medication: prescription.medication,
      dose: data.dose,
      status: data.status
    }
  });

  return administration;
}

export async function getPatientAdministrations(patientId: string) {
  return prisma.medicationAdministration.findMany({
    where: { patientId },
    orderBy: { administeredAt: 'desc' },
    include: {
      prescription: {
        select: {
          medication: true,
          dosage: true,
          route: true,
          status: true
        }
      },
      administeredBy: {
        select: { id: true, firstName: true, lastName: true, role: true }
      }
    }
  });
}
