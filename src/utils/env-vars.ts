import { z } from "zod";
import "dotenv/config";

import { config } from "dotenv";
config({ path: ".env.development" });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),

  DB_DEV_USER: z.string().default("user"),
  DB_DEV_PASSWORD: z.string().default("pass"),
  DB_DEV_NAME: z.string().default("db"),
  DB_DEV_HOST: z.string().default("postgres-dev"),
  DB_DEV_PORT: z.coerce.number().default(5432),
  DB_DEV_EXTERNAL_PORT: z.coerce.number().default(5433),

  DB_TEST_USER: z.string().default("user"),
  DB_TEST_PASSWORD: z.string().default("pass"),
  DB_TEST_NAME: z.string().default("db_test"),
  DB_TEST_HOST: z.string().default("postgres-test"),
  DB_TEST_PORT: z.coerce.number().default(5432),
  DB_TEST_EXTERNAL_PORT: z.coerce.number().default(5434),

  JWT_SECRET: z.string().min(1),

  RESEND_API_KEY: z.string().min(1),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),

  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_URL: z.string().optional(),

  CLOUDFLARE_ACCESS_TOKEN: z.string().min(1),
  CLOUDFLARE_ACCESS_KEY_ID: z.string().min(1),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string().min(1),
  CLOUDFLARE_ENDPOINT: z.url(),
  CLOUDFLARE_BUCKET_NAME: z.string().min(1),
});

export const env = envSchema.parse(process.env);
