import {
  userData,
  userService,
  compareHash,
  generateToken,
  encrypt,
  userDataToken,
  googleAuth,
  Provider,
} from "../../common";
import { redisService } from "../../common/services/redis.service";
import { dispatchSignUpOtp } from "../../common/events/otp.event";
import { User } from "../../DB/models/users.model";

class Auth {
  constructor() {}
  async signUp(userData: userData) {
    try {
      const normalizedEmail = userData.email.trim().toLowerCase();
      const user = await userService.findByEmail(normalizedEmail);
      if (user) {
        throw new Error("User already exists");
      }
      const encryptedPhone =
        userData.phone?.map((phone) => encrypt(phone)) ?? [];
      const newUser = await userService.createNewInstance({
        ...userData,
        email: normalizedEmail,
        phone: encryptedPhone,
      });
      try {
        console.warn(`[AUTH] Starting OTP dispatch for ${userData.email}`);
        await dispatchSignUpOtp(userData.email);
        console.warn(`[AUTH] OTP dispatch completed for ${userData.email}`);
      } catch (otpError) {
        console.error(
          `[AUTH] OTP dispatch failed for ${userData.email}:`,
          otpError,
        );
        await User.deleteOne({ email: normalizedEmail });
        const reason =
          otpError instanceof Error ? otpError.message : String(otpError);
        throw new Error(
          `Account could not be verified: ${reason}. Fix email or Redis configuration and try again.`,
        );
      }
      return newUser;
    } catch (error) {
      console.error("Sign Up failed:", error);
      const message = error instanceof Error ? error.message : "Sign Up Error";
      throw new Error(message);
    }
  }
  async signIn(userData: userData | userDataToken): Promise<any> {
    try {
      if ("token" in userData) {
        const payload = await googleAuth(userData.token);
        const email = payload?.email;
        if (!email) {
          throw new Error("Invalid Google token");
        }

        let user = await userService.findByEmail(email);
        if (!user) {
          const generatedPassword = Math.random().toString(36).slice(2, 12);
          await userService.createNewInstance({
            username: payload.name ?? email.split("@")[0],
            email,
            password: generatedPassword,
            provider: Provider.GOOGLE,
            confirmed: true,
            profilePicture: payload.picture ?? "",
          });
          user = await userService.findByEmail(email);
        }
        const token = generateToken({
          userId: user._id,
          username:payload.name,
          role: user.role,
          confirmed: user.confirmed,
        });
        await redisService.storeToken(
          token.accessToken,
          user._id.toString(),
          3600,
        );
        return token;
      }

      const user = await userService.findByEmail(userData.email);
      if (!user) {
        throw new Error("User not found");
      }
      const isPasswordValid = await compareHash(
        userData.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }
      const token = generateToken({
        userId: user._id,
        name:user.username,
        role: user.role,
        confirmed: user.confirmed,
      });
      await redisService.storeToken(
        token.accessToken,
        user._id.toString(),
        3600,
      );
      return token;
    } catch (error) {
      console.error("Sign In failed:", error);
      const message = error instanceof Error ? error.message : "Sign In Error";
      throw new Error(message);
    }
  }

  async logout(token: string): Promise<boolean> {
    try {
      const revoked = await redisService.revokeToken(token);
      return revoked;
    } catch (error) {
      console.error("Logout failed:", error);
      const message = error instanceof Error ? error.message : "Logout Error";
      throw new Error(message);
    }
  }

  async logoutAll(userId: string): Promise<void> {
    try {
      await redisService.revokeAllUserTokens(userId);
    } catch (error) {
      console.error("Logout all failed:", error);
      const message =
        error instanceof Error ? error.message : "Logout All Error";
      throw new Error(message);
    }
  }

  async forgetPassword(email: string): Promise<void> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const user = await userService.findByEmail(normalizedEmail);
      if (!user) {
        throw new Error("User not found");
      }
      const { dispatchForgetPasswordOtp } = await import("../../common/events/otp.event");
      await dispatchForgetPasswordOtp(normalizedEmail);
    } catch (error) {
      console.error("Forget password failed:", error);
      throw new Error(error instanceof Error ? error.message : "Forget Password Error");
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const storedOtp = await redisService.getOtp(normalizedEmail);
      if (!storedOtp || storedOtp !== otp) {
        throw new Error("Invalid or expired OTP");
      }

      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        throw new Error("User not found");
      }

      user.password = newPassword;
      await user.save();
      await redisService.deleteOtp(normalizedEmail);
    } catch (error) {
      console.error("Reset password failed:", error);
      throw new Error(error instanceof Error ? error.message : "Reset Password Error");
    }
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const isPasswordValid = await compareHash(oldPassword, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid current password");
      }

      user.password = newPassword;
      await user.save();
    } catch (error) {
      console.error("Update password failed:", error);
      throw new Error(error instanceof Error ? error.message : "Update Password Error");
    }
  }
}

export const auth = new Auth();
