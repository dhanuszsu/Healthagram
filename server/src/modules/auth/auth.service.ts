import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db.js';
import { env } from '../../config/env.js';
import { AppError } from '../../middleware/errorHandler.js';
import { recordAudit } from '../../services/audit.service.js';

export async function loginUser(email: string, passwordPlain: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { doctorProfile: true }
  });

  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(passwordPlain, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  await recordAudit({
    userId: user.id,
    action: 'USER_LOGIN',
    entity: 'User',
    entityId: user.id,
    details: { email: user.email, role: user.role }
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      doctorProfile: user.doctorProfile
    }
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { doctorProfile: true }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    doctorProfile: user.doctorProfile
  };
}

export async function getAllDoctors() {
  return prisma.user.findMany({
    where: {
      isActive: true,
      role: { in: ['JUNIOR_DOCTOR', 'SENIOR_DOCTOR', 'SPECIALIST'] }
    },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      doctorProfile: {
        select: {
          specialization: true,
          rank: true,
          department: true,
          licenseNumber: true
        }
      }
    },
    orderBy: { lastName: 'asc' }
  });
}
