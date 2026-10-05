import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __healthagram_prisma__: PrismaClient | undefined;
}

export const prisma = global.__healthagram_prisma__ || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

if (process.env.NODE_ENV !== 'production') {
  global.__healthagram_prisma__ = prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error('[Database] Failed to connect to database:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
