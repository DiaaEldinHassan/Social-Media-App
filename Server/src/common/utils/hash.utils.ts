import bcrypt from "bcrypt";
import { env } from "../../config/env.config";
import { BadRequestError } from "./error.utils";

export const hashing = async (plainText: string): Promise<string> => {
  try {
    const saltRounds = env.SALT ? Number(env.SALT) : 12;
    const hashed = await bcrypt.hash(plainText, saltRounds);
    return hashed as string;
  } catch (error) {
    throw new BadRequestError("Hashing Error");
  }
};

export const compareHash = async (
  plainText: string,
  hashedText: string,
): Promise<boolean> => {
  try {
    return await bcrypt.compare(plainText, hashedText);
  } catch (error) {
    throw new BadRequestError("Hash Compare Error");
  }
};
