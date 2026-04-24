import { Router } from "express";
import type {
  Router as RouterType,
  Request,
  Response,
  NextFunction,
} from "express";
import { auth } from "./auth.service";
import { validate } from "../../middleware";
import {
  registerSchema,
  loginSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from "./auth.validation";
import { usersService } from "../users/users.service";
import { authMiddleware } from "../../middleware";

export const router: RouterType = Router();

router.post(
  "/signUp",
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const registerData = req.body;
      const result = await auth.signUp(registerData);
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        statusCode: 201,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/signIn",
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const registerData = req.body;
      const result = await auth.signIn(registerData);
      res.status(200).json({
        success: true,
        message: "User signed in successfully",
        statusCode: 200,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/confirmOtp",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp } = req.body;
      const result = await usersService.confirmOtp(email, otp);
      res.status(200).json({
        success: true,
        message: "OTP confirmed successfully",
        statusCode: 200,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/logout",
  authMiddleware(),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = Array.isArray(authHeader)
        ? authHeader[0].split(" ")[1]
        : authHeader?.split(" ")[1];

      if (!token) {
        res.status(400).json({ message: "No token provided" });
        return;
      }

      const result = await auth.logout(token);
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
        statusCode: 200,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/logoutAll",
  authMiddleware(),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      await auth.logoutAll(user.userId);
      res.status(200).json({
        success: true,
        message: "Logged out from all devices successfully",
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/forget-password",
  validate(forgetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      await auth.forgetPassword(email);
      res.status(200).json({
        success: true,
        message: "OTP sent to your email",
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp, newPassword } = req.body;
      await auth.resetPassword(email, otp, newPassword);
      res.status(200).json({
        success: true,
        message: "Password reset successfully",
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/update-password",
  authMiddleware(),
  validate(updatePasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const { oldPassword, newPassword } = req.body;
      await auth.updatePassword(userId, oldPassword, newPassword);
      res.status(200).json({
        success: true,
        message: "Password updated successfully",
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  },
);
