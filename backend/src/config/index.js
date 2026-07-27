import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../');

// 1. Load .env file if it exists (Development/Local)
const envPath = path.join(PROJECT_ROOT, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`Loaded .env from: ${envPath}`);
} else {
  console.log('No .env file found. Relying on system environment variables.');
}

// 2. Define strict schema for environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(10, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('uploads/documents'),
  MAX_FILE_SIZE_MB: z.coerce.number().int().positive().default(10),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  MAIL_HOST: z.string().default('localhost'),
  MAIL_PORT: z.coerce.number().int().default(587),
  MAIL_USER: z.string().default(''),
  MAIL_PASS: z.string().default(''),
  MAIL_FROM: z.string().default('"ESS Portal" <noreply@essportal.com>'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().default(6379),
  REDIS_PASSWORD: z.string().default(''),
  REDIS_DB: z.coerce.number().int().default(0),
});

// 3. Parse and validate
let parsedEnv;
try {
  parsedEnv = envSchema.parse(process.env);
  console.log('Environment variables validated successfully');
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Environment validation failed:');
    error.errors.forEach((err) => {
      console.error(`  • ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

// 4. Export structured, type-safe configuration object
export const config = {
  env: parsedEnv.NODE_ENV,
  isDev: parsedEnv.NODE_ENV === 'development',
  isProd: parsedEnv.NODE_ENV === 'production',
  isTest: parsedEnv.NODE_ENV === 'test',
  port: parsedEnv.PORT,

  db: {
    url: parsedEnv.DATABASE_URL,
  },

  jwt: {
    secret: parsedEnv.JWT_SECRET,
    refreshSecret: parsedEnv.JWT_REFRESH_SECRET,
    expiresIn: parsedEnv.JWT_EXPIRES_IN,
    refreshExpiresIn: parsedEnv.JWT_REFRESH_EXPIRES_IN,
  },

  bcrypt: {
    saltRounds: parsedEnv.BCRYPT_SALT_ROUNDS,
  },

  cors: {
    frontendUrl: parsedEnv.FRONTEND_URL,
    origins: parsedEnv.CORS_ORIGINS.split(',').map((o) => o.trim()),
  },

  uploads: {
    dir: path.isAbsolute(parsedEnv.UPLOAD_DIR)
      ? parsedEnv.UPLOAD_DIR
      : path.join(PROJECT_ROOT, parsedEnv.UPLOAD_DIR),
    maxFileSizeBytes: parsedEnv.MAX_FILE_SIZE_MB * 1024 * 1024,
  },

  logger: {
    level: parsedEnv.LOG_LEVEL,
  },

  mail: {
    host: parsedEnv.MAIL_HOST,
    port: parsedEnv.MAIL_PORT,
    user: parsedEnv.MAIL_USER,
    pass: parsedEnv.MAIL_PASS,
    from: parsedEnv.MAIL_FROM,
    frontendUrl: parsedEnv.FRONTEND_URL,
  },

  redis: {
    host: parsedEnv.REDIS_HOST,
    port: parsedEnv.REDIS_PORT,
    password: parsedEnv.REDIS_PASSWORD || undefined,
    db: parsedEnv.REDIS_DB,
  },
};
