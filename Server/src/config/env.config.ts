import { config } from "dotenv";
import fs from "fs";
import path from "path";

/** Resolves .env regardless of process.cwd() (e.g. running from monorepo root). */
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

export const env = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  REDIS_URL: process.env.REDIS_URL,
  SALT: process.env.SALT,
  JWT_SECRET: process.env.JWT_SECRET,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  ORIGIN: process.env.ORIGIN,
  NODEMAILER_EMAIL: process.env.NODEMAILER_EMAIL,
  NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};
