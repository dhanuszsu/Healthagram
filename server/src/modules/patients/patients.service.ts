import { prisma } from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { recordClinicalEvent } from '../../services/event.service.js';
import { recordAudit } from '../../services/audit.service.js';
import { ClinicalEventType } from '@prisma/client';

export async function listPatients(search?: string, user?: { id: string; role: string }) {
  const whereConditions: any[] = [];
  if (search) {
    whereConditions.push({
      OR: [
        { name: { contains: search } },
        { mrn: { contains: search } }
      ]
    });
  }
  if (user && user.role === 'SPECIALIST') {
    whereConditions.push({
      OR: [
        { specialistReferrals: { some: { specialistId: user.id } } },
        { patientAssignments: { some: { doctorId: user.id, active: true } } }
      ]
    });
  }
  const where = whereConditions.length > 0 ? { AND: whereConditions } : undefined;

  return prisma.patient.findMany({
    where,
    include: {
      encounters: {
        where: { status: 'ACTIVE' },
        orderBy: { startTime: 'desc' },
        take: 1
      },
      patientAssignments: {
        where: { active: true },
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
      },
      _count: {
        select: {
          clinicalEvents: true,
          prescriptions: true,
          investigations: true,
          specialistReferrals: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getPatientById(id: string, user?: { id: string; role: string }) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      encounters: {
        orderBy: { startTime: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          }
        }
      },
      patientAssignments: {
        where: { active: true },
        include: {
          doctor: {
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
      },
      prescriptions: {
        orderBy: { createdAt: 'desc' },
        include: {
          prescribedBy: {
            select: { id: true, firstName: true, lastName: true, role: true }
          },
          changedBy: {
            select: { id: true, firstName: true, lastName: true, role: true }
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
      },
      investigations: {
        orderBy: { orderedAt: 'desc' },
        include: {
          orderedBy: {
            select: { id: true, firstName: true, lastName: true, role: true }
          },
          results: {
            include: {
              reportedBy: {
                select: { id: true, firstName: true, lastName: true, role: true }
              },
              reviewedBy: {
                select: { id: true, firstName: true, lastName: true, role: true }
              }
            }
          }
        }
      },
      specialistReferrals: {
        orderBy: { createdAt: 'desc' },
        include: {
          referringDoctor: {
            select: { id: true, firstName: true, lastName: true, role: true }
          },
          specialist: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
              doctorProfile: { select: { specialization: true, rank: true } }
            }
          }
        }
      },
      clinicalCommunications: {
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, role: true }
          },
          receiver: {
            select: { id: true, firstName: true, lastName: true, role: true }
          }
        }
      }
    }
  });

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  // Authorization check: Specialists only access patients referred or assigned to them
  if (user && user.role === 'SPECIALIST') {
    const isAuthorized =
      patient.specialistReferrals?.some((r) => r.specialistId === user.id) ||
      patient.patientAssignments?.some((a) => a.doctorId === user.id && a.active);
    if (!isAuthorized) {
      throw new AppError('Access restricted: Specialist has not been consulted or assigned to this patient', 403);
    }
  }

  return patient;
}

export async function createPatient(data: {
  name: string;
  mrn: string;
  dateOfBirth: string | Date;
  gender: string;
  contact: string;
  allergies?: string;
  medicalHistory?: string;
  creatorId: string;
}) {
  const dob = new Date(data.dateOfBirth);
  const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  const patient = await prisma.patient.create({
    data: {
      name: data.name,
      mrn: data.mrn,
      dateOfBirth: dob,
      age: Math.max(0, age),
      gender: data.gender,
      contact: data.contact,
      allergies: data.allergies,
      medicalHistory: data.medicalHistory
    }
  });

  // Record initial timeline event and audit
  await recordClinicalEvent({
    patientId: patient.id,
    eventType: 'ASSESSMENT',
    title: 'Patient Registered in Clinical System',
    description: `Patient ${patient.name} (${patient.mrn}) admitted/registered. Initial medical history and baseline documented.`,
    createdById: data.creatorId,
    metadata: {
      allergies: patient.allergies,
      medicalHistory: patient.medicalHistory
    }
  });

  await recordAudit({
    userId: data.creatorId,
    patientId: patient.id,
    action: 'CREATE_PATIENT',
    entity: 'Patient',
    entityId: patient.id,
    details: { name: patient.name, mrn: patient.mrn }
  });

  return patient;
}

export async function getPatientTimeline(patientId: string, order: 'asc' | 'desc' = 'asc') {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId }
  });

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  return prisma.clinicalEvent.findMany({
    where: { patientId },
    orderBy: { createdAt: order },
    include: {
      createdBy: {
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
      },
      encounter: {
        select: {
          id: true,
          type: true,
          reason: true,
          status: true
        }
      }
    }
  });
}

export async function addPatientClinicalEvent(params: {
  patientId: string;
  encounterId?: string;
  eventType: ClinicalEventType;
  title: string;
  description: string;
  createdById: string;
  metadata?: Record<string, unknown>;
}) {
  const patient = await prisma.patient.findUnique({
    where: { id: params.patientId }
  });

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  return recordClinicalEvent({
    patientId: params.patientId,
    encounterId: params.encounterId,
    eventType: params.eventType,
    title: params.title,
    description: params.description,
    createdById: params.createdById,
    metadata: params.metadata
  });
}

export async function markPatientViewed(patientId: string, userId: string) {
  return prisma.patientViewAudit.upsert({
    where: {
      userId_patientId: { userId, patientId }
    },
    update: { viewedAt: new Date() },
    create: { userId, patientId, viewedAt: new Date() }
  });
}

export async function getWhatChanged(patientId: string, userId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId }
  });

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  const lastAudit = await prisma.patientViewAudit.findUnique({
    where: {
      userId_patientId: { userId, patientId }
    }
  });

  // Default window: last view or past 24 hours
  const since = lastAudit ? lastAudit.viewedAt : new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [recentEvents, recentPrescriptions, recentInvestigations, recentCommunications, recentReferrals] =
    await Promise.all([
      prisma.clinicalEvent.findMany({
        where: {
          patientId,
          createdAt: { gt: since },
          createdById: { not: userId }
        },
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true, role: true }
          }
        }
      }),
      prisma.prescription.findMany({
        where: {
          patientId,
          OR: [
            { createdAt: { gt: since } },
            { stoppedAt: { gt: since } }
          ]
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          prescribedBy: { select: { id: true, firstName: true, lastName: true, role: true } },
          changedBy: { select: { id: true, firstName: true, lastName: true, role: true } }
        }
      }),
      prisma.investigation.findMany({
        where: {
          patientId,
          updatedAt: { gt: since }
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          orderedBy: { select: { id: true, firstName: true, lastName: true, role: true } },
          results: {
            include: { reportedBy: { select: { id: true, firstName: true, lastName: true, role: true } } }
          }
        }
      }),
      prisma.clinicalCommunication.findMany({
        where: {
          patientId,
          createdAt: { gt: since },
          senderId: { not: userId }
        },
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, role: true } }
        }
      }),
      prisma.specialistReferral.findMany({
        where: {
          patientId,
          OR: [
            { createdAt: { gt: since } },
            { recommendationAt: { gt: since } }
          ]
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          referringDoctor: { select: { id: true, firstName: true, lastName: true, role: true } },
          specialist: { select: { id: true, firstName: true, lastName: true, role: true, doctorProfile: true } }
        }
      })
    ]);

  return {
    patientId,
    lastViewedAt: lastAudit?.viewedAt || null,
    since,
    recentEvents,
    recentPrescriptions,
    recentInvestigations,
    recentCommunications,
    recentReferrals,
    totalChanges:
      recentEvents.length +
      recentPrescriptions.length +
      recentInvestigations.length +
      recentCommunications.length +
      recentReferrals.length
  };
}
