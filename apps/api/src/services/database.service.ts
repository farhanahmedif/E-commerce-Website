import { prisma } from '../lib/prisma';

export type DatabaseHealth = {
  status: 'connected' | 'not_configured' | 'unavailable';
};

export async function checkDatabase(): Promise<DatabaseHealth> {
  if (!prisma) return { status: 'not_configured' };

  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'connected' };
  } catch {
    return { status: 'unavailable' };
  }
}
