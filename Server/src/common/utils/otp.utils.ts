import crypto from "node:crypto";

export const generateOtp = (): string =>
  String(crypto.randomInt(100_000, 1_000_000));
