import crypto from "node:crypto";
import { env } from "../../config/env.config";

const alg = "aes-256-cbc";

type EncryptedPhone = {
  encryptedPhoneNumber: string;
  iv: string;
};

export const encrypt = (text: string): EncryptedPhone => {
  try {
    const iv = crypto.randomBytes(16);
    const key = crypto
      .createHash("sha256")
      .update(String(env.ENCRYPTION_KEY))
      .digest("base64")
      .slice(0, 32);
    const cipher = crypto.createCipheriv(alg, key, iv);
    const encryptedPhoneNumber =
      cipher.update(text, "utf-8", "base64") + cipher.final("base64");

    return {
      encryptedPhoneNumber,
      iv: iv.toString("base64"),
    };
  } catch (error) {
    throw error;
  }
};

export const decrypt = (payload: EncryptedPhone): string => {
  try {
    const key = crypto
      .createHash("sha256")
      .update(String(env.ENCRYPTION_KEY))
      .digest("base64")
      .slice(0, 32);
    const iv = Buffer.from(payload.iv, "base64");
    const decipher = crypto.createDecipheriv(alg, key, iv);
    const decryptedText = decipher.update(
      payload.encryptedPhoneNumber,
      "base64",
      "utf-8",
    );
    return decryptedText + decipher.final("utf-8");
  } catch (error) {
    throw error;
  }
};
