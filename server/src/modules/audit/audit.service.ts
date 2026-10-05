import { prisma } from '../../config/db.js';

export async function getPatientAuditLogs(patientId: string) {
  return prisma.auditLog.findMany({
    where: { patientId },
    orderBy: { timestamp: 'desc' },
    include: {
      user: {
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
}

export async function getAllAuditLogs(limit = 100) {
  return prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true
        }
      },
      patient: {
        select: {
          id: true,
          name: true,
          mrn: true
        }
      }
    }
  });
}
