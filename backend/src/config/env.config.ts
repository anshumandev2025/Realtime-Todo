import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, "MongoDB URI is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT Access Secret is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT Refresh Secret is required"),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
});

type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    process.exit(1);
  }

  return parsed.data;
}

export const env = validateEnv();
