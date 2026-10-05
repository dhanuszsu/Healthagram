import { prisma } from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      patient: {
        select: { id: true, name: true, mrn: true }
      }
    }
  });
}

export async function markNotificationAsRead(id: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id }
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (notification.userId !== userId) {
    throw new AppError('Unauthorized access to notification', 403);
  }

  return prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });
}
