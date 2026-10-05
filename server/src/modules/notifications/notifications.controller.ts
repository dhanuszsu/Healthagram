import { Request, Response, NextFunction } from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from './notifications.service.js';
import { sendSuccess } from '../../utils/response.js';

export async function getNotificationsController(req: Request, res: Response, next: NextFunction) {
  try {
    const notifications = await getUserNotifications(req.user!.id);
    return sendSuccess(res, notifications, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
}

export async function markReadController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const updated = await markNotificationAsRead(id, req.user!.id);
    return sendSuccess(res, updated, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
}

export async function markAllReadController(req: Request, res: Response, next: NextFunction) {
  try {
    await markAllNotificationsAsRead(req.user!.id);
    return sendSuccess(res, { count: 0 }, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
}
