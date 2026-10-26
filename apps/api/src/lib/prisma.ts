import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { env } from '../config/env';

const globalForPrisma = globalThis as typeof globalThis & {
  haatgoPrisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient | null {
  if (!env.DATABASE_URL) return null;

  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
    connectionTimeoutMillis: 5_000,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.haatgoPrisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.haatgoPrisma = prisma;
}
