import { Router } from "express";
import type { Router as RouterType, Request, Response, NextFunction } from "express";
import { authMiddleware, validate } from "../../middleware";
import { Role } from "../../common";
import { reactionsService } from "./reactions.service";
import { removeReactionSchema, upsertReactionSchema } from "./reactions.validation";

export const router: RouterType = Router();

router.post(
  "/",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  validate(upsertReactionSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId as string;
      const data = await reactionsService.upsertReaction({
        userId,
        targetType: req.body.targetType,
        targetId: req.body.targetId,
        type: req.body.type,
      });
      res.status(200).json({ success: true, statusCode: 200, data });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/:targetType/:targetId",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  validate(removeReactionSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId as string;
      const result = await reactionsService.removeReaction(
        userId,
        req.params.targetType as "post" | "comment",
        String(req.params.targetId),
      );
      res.status(200).json({ success: true, statusCode: 200, ...result });
    } catch (error) {
      next(error);
    }
  },
);
