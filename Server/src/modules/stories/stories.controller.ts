import { Router } from "express";
import type { Router as RouterType, Request, Response, NextFunction } from "express";
import { authMiddleware, validate } from "../../middleware";
import { Role } from "../../common";
import { storiesService } from "./stories.service";
import { createStorySchema, storyIdSchema } from "./stories.validation";

export const router: RouterType = Router();

router.post(
  "/",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  validate(createStorySchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId as string;
      const story = await storiesService.createStory(userId, req.body);
      res.status(201).json({ success: true, statusCode: 201, data: story });
    } catch (error) {
      next(error);
    }
  },
);

router.get("/", async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stories = await storiesService.listActiveStories();
    res.status(200).json({ success: true, statusCode: 200, data: stories });
  } catch (error) {
    next(error);
  }
});

router.delete(
  "/:storyId",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  validate(storyIdSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId as string;
      const force = req.query.force === "true";
      const data = force
        ? await storiesService.hardDeleteStory(userId, String(req.params.storyId))
        : await storiesService.deleteStory(userId, String(req.params.storyId));
      res.status(200).json({ success: true, statusCode: 200, ...data });
    } catch (error) {
      next(error);
    }
  },
);
