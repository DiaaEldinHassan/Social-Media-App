import { redisService } from "../services/redis.service";
import { sendOTP } from "../utils/nodemailer.utils";
import { generateOtp } from "../utils/otp.utils";

export async function dispatchSignUpOtp(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const otp = generateOtp();
  await redisService.storeOtp(normalizedEmail, otp);
  await sendOTP(email.trim(), otp);
}

export async function dispatchForgetPasswordOtp(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const otp = generateOtp();
  await redisService.storeOtp(normalizedEmail, otp, 600); // 10 minutes
  await sendOTP(email.trim(), otp);
}
