import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

interface NotificationParams {
  userId: string;
  patientId?: string | null;
  type: string;
  title: string;
  message: string;
  referenceId?: string | null;
}

export async function createNotification(params: NotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        patientId: params.patientId ?? null,
        type: params.type,
        title: params.title,
        message: params.message,
        referenceId: params.referenceId ?? null
      }
    });
    logger.info(`[Notification] Created for User ${params.userId}: ${params.title}`);
    return notification;
  } catch (error) {
    logger.error('Failed to create notification:', error);
  }
}

export async function notifyCareTeam(params: {
  patientId: string;
  excludeUserId?: string;
  type: string;
  title: string;
  message: string;
  referenceId?: string | null;
}) {
  try {
    const assignments = await prisma.patientAssignment.findMany({
      where: {
        patientId: params.patientId,
        active: true,
        ...(params.excludeUserId && { doctorId: { not: params.excludeUserId } })
      },
      select: { doctorId: true }
    });

    const uniqueDoctorIds = Array.from(new Set(assignments.map((a) => a.doctorId)));

    for (const doctorId of uniqueDoctorIds) {
      await createNotification({
        userId: doctorId,
        patientId: params.patientId,
        type: params.type,
        title: params.title,
        message: params.message,
        referenceId: params.referenceId
      });
    }
  } catch (error) {
    logger.error('Failed to notify care team:', error);
  }
}
