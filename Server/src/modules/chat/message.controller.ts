import { Router } from "express";
import type { Router as RouterType, Request, Response, NextFunction } from "express";
import { authMiddleware } from "../../middleware";
import { Role } from "../../common";
import { messageService } from "./message.service";
import { groupService } from "./group.service";

export const router: RouterType = Router();

// ---- Group routes (before :userId to avoid param conflict) ----

router.post(
  "/groups",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = (req as any).user.userId;
      const { name, description, memberIds } = req.body;
      if (!name || !name.trim()) {
        res.status(400).json({ success: false, message: "Group name is required" });
        return;
      }
      const group = await groupService.createGroup(
        name.trim(),
        description || "",
        currentUserId,
        memberIds || [],
      );
      res.status(201).json({ success: true, data: group });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/groups",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = (req as any).user.userId;
      const groups = await groupService.getMyGroups(currentUserId);
      res.status(200).json({ success: true, data: groups });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/groups/:groupId",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const group = await groupService.getGroupById(String(req.params.groupId));
      if (!group) {
        res.status(404).json({ success: false, message: "Group not found" });
        return;
      }
      res.status(200).json({ success: true, data: group });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/groups/:groupId/members",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = (req as any).user.userId;
      const { memberIds } = req.body;
      const group = await groupService.addMembers(
        String(req.params.groupId),
        memberIds || [],
        currentUserId,
      );
      res.status(200).json({ success: true, data: group });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/groups/:groupId/members/:userId",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = (req as any).user.userId;
      const group = await groupService.removeMember(
        String(req.params.groupId),
        String(req.params.userId),
        currentUserId,
      );
      res.status(200).json({ success: true, data: group });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/groups/:groupId/messages",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const messages = await groupService.getGroupMessages(
        String(req.params.groupId),
        page,
        limit,
      );
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  },
);

// ---- DM conversation route ----

router.get(
  "/:userId",
  authMiddleware([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = (req as any).user.userId;
      const otherUserId = String(req.params.userId);
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const messages = await messageService.getConversation(
        currentUserId,
        otherUserId,
        page,
        limit,
      );
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  },
);

