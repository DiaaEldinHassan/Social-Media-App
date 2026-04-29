import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { z } from "zod";


function loadEnvFile(): void {
  const candidates = [
    path.join(__dirname, ".env.dev"),
    path.join(__dirname, "..", "..", "src", "config", ".env.dev"),
    path.join(process.cwd(), "src", "config", ".env.dev"),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (found) {
    config({ path: found });
    return;
  }
  console.warn(
    "[env] No .env.dev found. Tried:\n  " + candidates.join("\n  "),
  );
  config();
}

loadEnvFile();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  APP_NAME: z.string().default("SocialMediaApp"),
  MONGO_URI: z.string().default("mongodb://localhost:27017/SocialMediaApp"),
  REDIS_URL: z.string().min(1),
  SALT: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().optional(),
  ORIGIN: z.string().default("*"),
  NODEMAILER_EMAIL: z.string().optional(),
  NODEMAILER_PASSWORD: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  AWS_BUCKET_NAME: z.string(),
  AWS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_ENDPOINT: z.string().optional(),
  AWS_EXPIRY_TIME: z.coerce
    .number()
    .int()
    .positive()
    .optional(),
  AWS_EXPIRES_IN: z.coerce
    .number()
    .int()
    .positive()
    .optional(),
  FCM_SERVER_KEY: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  throw new Error(`Invalid environment configuration: ${parsedEnv.error.message}`);
}

export const env = {
  PORT: parsedEnv.data.PORT,
  APP_NAME: parsedEnv.data.APP_NAME,
  MONGO_URI: parsedEnv.data.MONGO_URI,
  REDIS_URL: parsedEnv.data.REDIS_URL,
  SALT: parsedEnv.data.SALT,
  JWT_SECRET: parsedEnv.data.JWT_SECRET,
  ENCRYPTION_KEY: parsedEnv.data.ENCRYPTION_KEY,
  GOOGLE_CLIENT_ID: parsedEnv.data.GOOGLE_CLIENT_ID,
  ORIGIN: parsedEnv.data.ORIGIN,
  NODEMAILER_EMAIL: parsedEnv.data.NODEMAILER_EMAIL,
  NODEMAILER_PASSWORD: parsedEnv.data.NODEMAILER_PASSWORD,
  CLOUDINARY_CLOUD_NAME: parsedEnv.data.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: parsedEnv.data.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: parsedEnv.data.CLOUDINARY_API_SECRET,
  AWS_S3_BUCKET_NAME: parsedEnv.data.AWS_BUCKET_NAME,
  AWS_S3_ACCESS_KEY_ID: parsedEnv.data.AWS_KEY_ID,
  AWS_S3_SECRET_ACCESS_KEY: parsedEnv.data.AWS_SECRET_ACCESS_KEY,
  AWS_S3_REGION: parsedEnv.data.AWS_REGION,
  AWS_S3_ENDPOINT: parsedEnv.data.AWS_ENDPOINT,
  AWS_EXPIRY_TIME: parsedEnv.data.AWS_EXPIRY_TIME ?? parsedEnv.data.AWS_EXPIRES_IN ?? 300,
  FCM_SERVER_KEY: parsedEnv.data.FCM_SERVER_KEY,
};
