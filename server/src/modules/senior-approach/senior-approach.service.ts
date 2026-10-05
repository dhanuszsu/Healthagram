import { prisma } from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { recordAudit } from '../../services/audit.service.js';

export async function listSeniorApproaches() {
  return prisma.seniorApproach.findMany({
    orderBy: { sharedAt: 'desc' },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          mrn: true,
          age: true,
          gender: true,
          allergies: true,
          medicalHistory: true
        }
      },
      encounter: {
        select: {
          id: true,
          type: true,
          reason: true,
          status: true
        }
      },
      seniorDoctor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          doctorProfile: {
            select: {
              specialization: true,
              department: true,
              rank: true
            }
          }
        }
      }
    }
  });
}

export async function getSeniorApproachById(id: string) {
  const approach = await prisma.seniorApproach.findUnique({
    where: { id },
    include: {
      patient: {
        include: {
          encounters: { orderBy: { startTime: 'desc' }, take: 1 },
          prescriptions: { orderBy: { createdAt: 'desc' } },
          investigations: { orderBy: { orderedAt: 'desc' } }
        }
      },
      encounter: true,
      seniorDoctor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          doctorProfile: true
        }
      }
    }
  });

  if (!approach) {
    throw new AppError('Senior Approach case not found', 404);
  }

  return approach;
}

export async function createSeniorApproach(data: {
  patientId: string;
  encounterId?: string;
  seniorDoctorId: string;
  title: string;
  situation: string;
  assessment: string;
  decision: string;
  treatmentApproach: string;
  reasoning?: string;
  outcome?: string;
}) {
  const patient = await prisma.patient.findUnique({
    where: { id: data.patientId }
  });

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  // Idempotency: Check if an approach with the same title already exists for this patient
  const existingApproach = await prisma.seniorApproach.findFirst({
    where: {
      patientId: data.patientId,
      title: data.title
    },
    include: {
      seniorDoctor: {
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

  if (existingApproach) {
    return existingApproach;
  }

  const approach = await prisma.seniorApproach.create({
    data: {
      patientId: data.patientId,
      encounterId: data.encounterId,
      seniorDoctorId: data.seniorDoctorId,
      title: data.title,
      situation: data.situation,
      assessment: data.assessment,
      decision: data.decision,
      treatmentApproach: data.treatmentApproach,
      reasoning: data.reasoning,
      outcome: data.outcome
    },
    include: {
      seniorDoctor: {
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

  await recordAudit({
    userId: data.seniorDoctorId,
    patientId: data.patientId,
    action: 'SHARE_SENIOR_APPROACH',
    entity: 'SeniorApproach',
    entityId: approach.id,
    details: { title: data.title }
  });

  return approach;
}
