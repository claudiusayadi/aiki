import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { z } from 'zod';

dotenvExpand.expand(dotenv.config());

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test', 'staging'])
    .default('development'),
  API_PORT: z.coerce.number().min(1, 'API_PORT is required!'),
  API_TOKEN: z.string().min(1, 'API_TOKEN is required!'),

  DB_URL: z.string().min(1, 'DB_URL is required!'),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().optional(),

  JWT_SECRET: z.string().min(64, 'JWT_SECRET must be at least 64 characters!'),
  JWT_ISSUER: z.string().min(1, 'JWT_ISSUER is required!'),
  JWT_AUDIENCE: z.string().min(1, 'JWT_AUDIENCE is required!'),
  JWT_ACCESS_TOKEN_TTL: z.coerce
    .number()
    .min(1, 'JWT_ACCESS_TOKEN_TTL is required!'),
  JWT_REFRESH_TOKEN_TTL: z.coerce
    .number()
    .min(1, 'JWT_REFRESH_TOKEN_TTL is required!'),

  HTTP_TIMEOUT: z.coerce.number().min(1, 'HTTP_TTL is required!'),
  HTTP_MAX_REDIRECTS: z.coerce
    .number()
    .min(0, 'HTTP_MAX_REDIRECTS is required!'),

  THROTTLER_TTL: z.coerce.number().min(1, 'THROTTLER_TTL is required!'),
  THROTTLER_LIMIT: z.coerce.number().min(1, 'THROTTLER_LIMIT is required!'),

  VERIFICATION_CODE_TTL: z.coerce
    .number()
    .min(1, 'VERIFICATION_CODE_EXPIRY is required!'),
  EMAIL_HOST: z.string().min(1, 'EMAIL_HOST is required!'),
  EMAIL_PORT: z.coerce.number().min(1, 'EMAIL_PORT is required!'),
  EMAIL_USERNAME: z.string().min(1, 'EMAIL_USERNAME is required!'),
  EMAIL_PASSWORD: z.string().min(1, 'EMAIL_PASSWORD is required!'),
  EMAIL_FROM: z.string().min(1, 'EMAIL_FROM is required!'),
  EMAIL_SENDER: z.string().min(1, 'EMAIL_SENDER is required!'),
  EMAIL_SECURE: z.coerce.boolean(),

  PAYSTACK_SECRET_KEY: z.string().min(1, 'PAYSTACK_SECRET_KEY is required!'),
  PAYSTACK_PUBLIC_KEY: z.string().min(1, 'PAYSTACK_PUBLIC_KEY is required!'),
  PAYSTACK_BASE_URL: z.string().min(1, 'PAYSTACK_BASE_URL is required!'),
  PAYSTACK_SUCCESS_URL: z.string().min(1, 'PAYSTACK_SUCCESS_URL is required!'),
});

export type ApiConfig = z.infer<typeof envSchema>;

export const validateEnv = (): ApiConfig => envSchema.parse(process.env);

export const ApiConfig = validateEnv();
