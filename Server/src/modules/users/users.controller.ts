import { Router } from "express";
import type {
  Router as RouterType,
  Request,
  Response,
  NextFunction,
} from "express";
import { authMiddleware, upload } from "../../middleware";
import { Role } from "../../common";
import { validate } from "../../middleware";
import { updateUserDataSchema, profilePicSchema } from "./users.validation";

import { usersService } from "./users.service";

export const router: RouterType = Router();

router.get(
  "/",
  authMiddleware([Role.USER, Role.ADMIN, Role.MODERATOR, Role.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      res.status(200).json({ message: `Welcome ${user.name}` });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/me",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const user = await usersService.getUserData(userId);
      res.status(200).json({ message: "User data retrieved", user });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/me",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  validate(updateUserDataSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const updatedUser = await usersService.updateUserData(userId, req.body);
      res
        .status(200)
        .json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/profile-pic",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  upload.single("ProfilePic"),
  validate(profilePicSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const fileBuffer = req.file?.buffer;
      const uploadResult = await usersService.prepareProfilePicUpload(
        userId,
        fileBuffer
      );
      res
        .status(200)
        .json({ message: "Profile picture updated", url: uploadResult });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/video-upload",
  authMiddleware([Role.USER, Role.ADMIN, Role.MODERATOR, Role.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const ticket = await usersService.prepareVideoUpload(userId);
      res.status(200).json({
        status: "success",
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }
);
