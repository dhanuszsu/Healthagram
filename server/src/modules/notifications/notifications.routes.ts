import { Router } from 'express';
import {
  getNotificationsController,
  markReadController,
  markAllReadController
} from './notifications.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

notificationsRouter.get('/', getNotificationsController);
notificationsRouter.patch('/:id/read', markReadController);
notificationsRouter.patch('/read-all', markAllReadController);
