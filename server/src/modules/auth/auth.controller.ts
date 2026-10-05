import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { loginUser, getCurrentUser, getAllDoctors } from './auth.service.js';
import { sendSuccess } from '../../utils/response.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await loginUser(email, password);
    return sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
}

export async function meController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const user = await getCurrentUser(userId);
    return sendSuccess(res, user, 'Current user profile retrieved');
  } catch (error) {
    next(error);
  }
}

export async function listDoctorsController(_req: Request, res: Response, next: NextFunction) {
  try {
    const doctors = await getAllDoctors();
    return sendSuccess(res, doctors, 'Clinical doctors retrieved');
  } catch (error) {
    next(error);
  }
}
