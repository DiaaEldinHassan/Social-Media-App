import { Router } from "express";
import type { Router as RouterType, Request, Response, NextFunction } from "express";
import { authMiddleware } from "../../middleware";
import { Role } from "../../common";
import { feedService } from "./feed.service";

export const router: RouterType = Router();

router.get("/", authMiddleware([Role.USER, Role.ADMIN, Role.MODERATOR, Role.SUPER_ADMIN]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const feed = await feedService.getFeed(
      userId,
      req.query.page ? Number(req.query.page) : undefined,
      req.query.limit ? Number(req.query.limit) : undefined,
    );
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Feed retrieved successfully",
      data: feed,
    });
  } catch (error) {
    next(error);
  }
});
