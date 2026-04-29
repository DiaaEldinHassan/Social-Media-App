import { Router } from "express";
import type { Router as RouterType, Request, Response, NextFunction } from "express";
import { authMiddleware, validate } from "../../middleware";
import { Role } from "../../common";
import {
  createPostSchema,
  listPostsSchema,
  postIdParamSchema,
  updatePostSchema,
} from "./posts.validation";
import { postsService } from "./posts.service";

export const router: RouterType = Router();

router.post(
  "/",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  validate(createPostSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId as string;
      const post = await postsService.createPost({
        title: req.body.title,
        content: req.body.content,
        userId,
      });

      res.status(201).json({
        success: true,
        message: "Post created successfully",
        statusCode: 201,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get("/", validate(listPostsSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const options: {
      authorId?: string;
      page?: number;
      limit?: number;
      withDeleted?: boolean;
    } = {};
    if (req.query.authorId) options.authorId = String(req.query.authorId);
    if (req.query.page) options.page = Number(req.query.page);
    if (req.query.limit) options.limit = Number(req.query.limit);
    if (req.query.withDeleted) options.withDeleted = req.query.withDeleted === "true";
    const posts = await postsService.listPosts(options);
    res.status(200).json({
      success: true,
      message: "Posts retrieved successfully",
      statusCode: 200,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:postId", validate(postIdParamSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await postsService.getPostById(String(req.params.postId));
    res.status(200).json({ success: true, statusCode: 200, data: post });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/:postId",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  validate(updatePostSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId as string;
      const updatedPost = await postsService.updatePost(
        String(req.params.postId),
        userId,
        req.body,
      );

      res.status(200).json({
        success: true,
        message: "Post updated successfully",
        statusCode: 200,
        data: updatedPost,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/:postId",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId as string;
      const result =
        req.query.force === "true"
          ? await postsService.hardDeletePost(String(req.params.postId), userId)
          : await postsService.deletePost(String(req.params.postId), userId);
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

router.patch(
  "/:postId/restore",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  validate(postIdParamSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId as string;
      const post = await postsService.restorePost(String(req.params.postId), userId);
      res.status(200).json({ success: true, statusCode: 200, data: post });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/:postId/hard",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  validate(postIdParamSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId as string;
      const result = await postsService.hardDeletePost(String(req.params.postId), userId);
      res.status(200).json({ success: true, statusCode: 200, ...result });
    } catch (error) {
      next(error);
    }
  },
);
