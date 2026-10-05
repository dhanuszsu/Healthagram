import { Router } from 'express';
import { loginController, meController, listDoctorsController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/login', loginController);
authRouter.get('/me', authenticate, meController);
authRouter.get('/doctors', authenticate, listDoctorsController);
