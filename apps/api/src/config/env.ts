import { z } from 'zod';

const postgresUrl = z
  .string()
  .url()
  .refine(
    (value) => value.startsWith('postgres://') || value.startsWith('postgresql://'),
    'must use the postgres:// or postgresql:// protocol',
  );

const envSchema = z.object({
  DATABASE_URL: postgresUrl.optional(),
  DIRECT_URL: postgresUrl.optional(),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4_000),
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  JWT_SECRET: z.string().min(32, 'must contain at least 32 characters'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
    .join('; ');
  console.error(`Invalid API environment configuration: ${details}`);
  process.exit(1);
}

export const env = parsedEnv.data;
