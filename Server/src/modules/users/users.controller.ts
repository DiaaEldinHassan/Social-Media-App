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
import {
  updateUserDataSchema,
  profilePicSchema,
  videoSchema,
  userIdParamSchema,
  registerFcmTokenSchema,
} from "./users.validation";

import { promisify } from "node:util";
import { pipeline } from "node:stream";

import { usersService } from "./users.service";
import { NotFoundError } from "../../common/utils/error.utils";

export const router: RouterType = Router();

const s3WriteStream = promisify(pipeline);

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
  },
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
  },
);

router.get(
  "/:userId",
  validate(userIdParamSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await usersService.getPublicUserData(String(req.params.userId));
      res.status(200).json({ message: "User data retrieved", user });
    } catch (error) {
      next(error);
    }
  },
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
  },
);

router.post(
  "/fcm-token",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  validate(registerFcmTokenSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const user = await usersService.registerFcmToken(userId, req.body.token);
      res.status(200).json({ message: "FCM token registered", user });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/:userId/posts",
  validate(userIdParamSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const posts = await usersService.listUserPosts(
        String(req.params.userId),
        req.query.page ? Number(req.query.page) : undefined,
        req.query.limit ? Number(req.query.limit) : undefined,
      );
      res.status(200).json({ message: "User posts retrieved", data: posts });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/me",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      if (req.query.force === "true") {
        const data = await usersService.hardDeleteMyAccount(userId);
        res.status(200).json(data);
        return;
      }
      const data = await usersService.deleteMyAccount(userId);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/me/restore",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const user = await usersService.restoreMyAccount(userId);
      res.status(200).json({ message: "User restored", user });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/profile-pic",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  upload.single("ProfilePic"),
  validate(profilePicSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const file = req.file as Express.Multer.File | undefined;
      if (!file) {
        throw new NotFoundError();
      }
      const uploadResult = await usersService.profilePic(file, userId);
      res
        .status(200)
        .json({ message: "Profile picture updated", url: uploadResult });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/video-upload",
  authMiddleware([Role.USER, Role.ADMIN, Role.MODERATOR, Role.SUPER_ADMIN]),
  upload.single("video"),
  validate(videoSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const file = req.file as Express.Multer.File;
      const upload = await usersService.uploadLargeData(file, userId);
      res.status(200).json(upload);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/presigned-link",
  authMiddleware([Role.USER, Role.ADMIN, Role.MODERATOR, Role.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const requestLink = await usersService.presignedLinkUpload(
        {
          ContentType: req.body.ContentType,
          OriginalName: req.body.OriginalName,
        },
        user,
      );
      res.status(200).json(requestLink);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/uploads/*path",
  authMiddleware([Role.USER, Role.ADMIN, Role.MODERATOR, Role.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = (req as any).user.userId;
    const { path } = req.params as { path: string[] };
    const Key = path.join("/");
    try {
      console.log(`DELETE request received for key: ${Key} by user: ${userId}`);
      const result = await usersService.deleteUserFile(Key, userId);
      console.log(`DELETE operation completed for key: ${Key}`);
      res.status(200).json(result);
    } catch (error) {
      console.error(`DELETE operation failed for key: ${Key}`, error);
      next(error);
    }
  },
);

router.get(
  "/uploads/*path",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { path } = req.params as { path: string[] };
      const Key = path.join("/");
      const { Body } = await usersService.getUserFile(Key);
      return await s3WriteStream(Body as NodeJS.ReadableStream, res);
    } catch (error) {
      next(error);
    }
  },
);
