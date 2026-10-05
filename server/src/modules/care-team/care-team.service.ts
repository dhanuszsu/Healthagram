import { prisma } from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { recordClinicalEvent } from '../../services/event.service.js';
import { recordAudit } from '../../services/audit.service.js';
import { createNotification } from '../../services/notification.service.js';

export async function assignDoctorToPatient(data: {
  patientId: string;
  doctorId: string;
  isPrimary?: boolean;
  notes?: string;
  assignedByUserId: string;
}) {
  const patient = await prisma.patient.findUnique({
    where: { id: data.patientId }
  });

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  const doctor = await prisma.user.findUnique({
    where: { id: data.doctorId },
    include: { doctorProfile: true }
  });

  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  // Deactivate any existing active assignment for this specific doctor-patient pair to avoid duplicate active slots
  await prisma.patientAssignment.updateMany({
    where: {
      patientId: data.patientId,
      doctorId: data.doctorId,
      active: true
    },
    data: {
      active: false,
      unassignedAt: new Date()
    }
  });

  if (data.isPrimary) {
    // If setting new primary, demote previous primary
    await prisma.patientAssignment.updateMany({
      where: {
        patientId: data.patientId,
        active: true,
        isPrimary: true
      },
      data: { isPrimary: false }
    });
  }

  const assignment = await prisma.patientAssignment.create({
    data: {
      patientId: data.patientId,
      doctorId: data.doctorId,
      role: doctor.role,
      isPrimary: data.isPrimary || false,
      notes: data.notes,
      active: true
    },
    include: {
      doctor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          doctorProfile: { select: { specialization: true, rank: true } }
        }
      }
    }
  });

  await recordClinicalEvent({
    patientId: data.patientId,
    eventType: 'HANDOVER',
    title: `Care Team Assigned: Dr. ${doctor.lastName} (${doctor.role})`,
    description: `Dr. ${doctor.firstName} ${doctor.lastName} assigned to ${patient.name}'s care team.${data.notes ? ` Notes: "${data.notes}"` : ''}`,
    createdById: data.assignedByUserId,
    metadata: {
      doctorId: doctor.id,
      role: doctor.role,
      isPrimary: assignment.isPrimary
    }
  });

  await createNotification({
    userId: data.doctorId,
    patientId: data.patientId,
    type: 'PATIENT_ASSIGNMENT',
    title: `Assigned to Patient ${patient.name}`,
    message: `You were assigned to care team for ${patient.name} (${patient.mrn}).`,
    referenceId: assignment.id
  });

  await recordAudit({
    userId: data.assignedByUserId,
    patientId: data.patientId,
    action: 'ASSIGN_CARE_TEAM',
    entity: 'PatientAssignment',
    entityId: assignment.id,
    details: { doctorId: data.doctorId, role: doctor.role, isPrimary: assignment.isPrimary }
  });

  return assignment;
}

export async function unassignDoctorFromPatient(assignmentId: string, unassigningUserId: string) {
  const assignment = await prisma.patientAssignment.findUnique({
    where: { id: assignmentId },
    include: { patient: true, doctor: true }
  });

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  const updated = await prisma.patientAssignment.update({
    where: { id: assignmentId },
    data: {
      active: false,
      unassignedAt: new Date()
    }
  });

  await recordClinicalEvent({
    patientId: assignment.patientId,
    eventType: 'HANDOVER',
    title: `Care Team Update: Dr. ${assignment.doctor.lastName} Unassigned`,
    description: `Dr. ${assignment.doctor.firstName} ${assignment.doctor.lastName} stepped off the active care team for ${assignment.patient.name}.`,
    createdById: unassigningUserId,
    metadata: { assignmentId, doctorId: assignment.doctorId }
  });

  await recordAudit({
    userId: unassigningUserId,
    patientId: assignment.patientId,
    action: 'UNASSIGN_CARE_TEAM',
    entity: 'PatientAssignment',
    entityId: assignmentId,
    details: { doctorId: assignment.doctorId }
  });

  return updated;
}

export async function getPatientCareTeam(patientId: string) {
  return prisma.patientAssignment.findMany({
    where: { patientId },
    orderBy: [{ active: 'desc' }, { assignedAt: 'desc' }],
    include: {
      doctor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          doctorProfile: {
            select: { specialization: true, rank: true, department: true }
          }
        }
      }
    }
  });
}
