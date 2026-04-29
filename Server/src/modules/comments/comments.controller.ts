import { Router } from "express";
import type { Router as RouterType, Request, Response, NextFunction } from "express";
import { authMiddleware, validate } from "../../middleware";
import { Role } from "../../common";
import { commentsService } from "./comments.service";
import {
  commentIdParamSchema,
  createCommentSchema,
  postCommentsSchema,
  updateCommentSchema,
} from "./comments.validation";

export const router: RouterType = Router();

router.post(
  "/",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  validate(createCommentSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId as string;
      const comment = await commentsService.createComment({
        postId: req.body.postId,
        content: req.body.content,
        userId,
        parentCommentId: req.body.parentCommentId,
      });

      res.status(201).json({
        success: true,
        message: "Comment created successfully",
        statusCode: 201,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/post/:postId",
  validate(postCommentsSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const options: { view?: "flat" | "tree"; page?: number; limit?: number } = {};
      if (req.query.view) options.view = req.query.view as "flat" | "tree";
      if (req.query.page) options.page = Number(req.query.page);
      if (req.query.limit) options.limit = Number(req.query.limit);
      const comments = await commentsService.listCommentsByPost(
        String(req.params.postId),
        options,
      );
      res.status(200).json({
        success: true,
        message: "Comments retrieved successfully",
        statusCode: 200,
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/:commentId",
  validate(commentIdParamSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comment = await commentsService.getCommentById(String(req.params.commentId));
      res.status(200).json({ success: true, statusCode: 200, data: comment });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/:commentId/replies",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  validate(commentIdParamSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId as string;
      const parent = await commentsService.getCommentById(String(req.params.commentId));
      const reply = await commentsService.createComment({
        postId: parent.postId.toString(),
        content: req.body.content,
        userId,
        parentCommentId: String(req.params.commentId),
      });
      res.status(201).json({ success: true, statusCode: 201, data: reply });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/:commentId",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  validate(updateCommentSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId as string;
      const updatedComment = await commentsService.updateComment(
        String(req.params.commentId),
        userId,
        req.body.content,
      );

      res.status(200).json({
        success: true,
        message: "Comment updated successfully",
        statusCode: 200,
        data: updatedComment,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/:commentId/restore",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  validate(commentIdParamSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId as string;
      const comment = await commentsService.restoreComment(String(req.params.commentId), userId);
      res.status(200).json({ success: true, statusCode: 200, data: comment });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/:commentId/hard",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  validate(commentIdParamSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId as string;
      const result = await commentsService.hardDeleteComment(
        String(req.params.commentId),
        userId,
      );
      res.status(200).json({ success: true, statusCode: 200, ...result });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/:commentId",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId as string;
      const result =
        req.query.force === "true"
          ? await commentsService.hardDeleteComment(String(req.params.commentId), userId)
          : await commentsService.deleteComment(String(req.params.commentId), userId);
      res.status(200).json({
        success: true,
        statusCode: 200,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },
);
