import { Comment } from "../../DB/models/comments.model";
import { Post } from "../../DB/models/posts.model";
import { NotFoundError, UnauthorizedError } from "../../common/utils/error.utils";
import { notificationEmitter, NOTIFICATION_EVENTS } from "../../common/events/notification.event";

class CommentsService {
  async createComment(data: {
    postId: string;
    content: string;
    userId: string;
    parentCommentId?: string;
  }) {
    const post = await Post.findById(data.postId);
    if (!post) {
      throw new NotFoundError("Post");
    }

    let rootCommentId: string | null = null;
    if (data.parentCommentId) {
      const parent = await Comment.findById(data.parentCommentId);
      if (!parent) throw new NotFoundError("Parent comment");
      rootCommentId = parent.rootCommentId?.toString() ?? parent._id.toString();
    }

    const comment = await Comment.create({
      postId: data.postId,
      content: data.content,
      createdBy: data.userId,
      parentCommentId: data.parentCommentId ?? null,
      rootCommentId,
    });

    // Emit notification event
    console.log(`[CommentsService] Emitting COMMENT_CREATED for post ${data.postId}`);
    notificationEmitter.emit(NOTIFICATION_EVENTS.COMMENT_CREATED, {
      userId: data.userId,
      postId: data.postId,
      content: data.content,
      commentId: comment._id.toString(),
    });

    return comment;
  }

  async listCommentsByPost(
    postId: string,
    options: { view?: "flat" | "tree"; page?: number; limit?: number } = {},
  ) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const comments = await Comment.find({ postId })
      .populate("createdBy", "username email profilePicture")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const enriched = await Promise.all(comments.map((comment) => this.enrichComment(comment)));
    if (options.view === "tree") return this.toTree(enriched);
    return enriched;
  }

  async getCommentById(commentId: string) {
    const comment = await Comment.findById(commentId).populate(
      "createdBy",
      "username email profilePicture",
    );
    if (!comment) throw new NotFoundError("Comment");
    return this.enrichComment(comment);
  }

  async updateComment(commentId: string, userId: string, content: string) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new NotFoundError("Comment");
    }

    if (comment.createdBy.toString() !== userId) {
      throw new UnauthorizedError("You can only update your own comments");
    }

    comment.content = content;
    await comment.save();
    return comment;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new NotFoundError("Comment");
    }

    if (comment.createdBy.toString() !== userId) {
      throw new UnauthorizedError("You can only delete your own comments");
    }

    await Comment.findByIdAndUpdate(commentId, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
      content: "[deleted]",
    });
    return { message: "Comment soft deleted successfully" };
  }

  async hardDeleteComment(commentId: string, userId: string) {
    const comment = await Comment.findById(commentId, null, { withDeleted: true } as any);
    if (!comment) throw new NotFoundError("Comment");
    if (comment.createdBy.toString() !== userId) {
      throw new UnauthorizedError("You can only hard delete your own comments");
    }
    await Comment.deleteMany({ $or: [{ _id: comment._id }, { rootCommentId: comment._id }] });
    return { message: "Comment hard deleted successfully" };
  }

  async restoreComment(commentId: string, userId: string) {
    const comment = await Comment.findById(commentId, null, { withDeleted: true } as any);
    if (!comment) throw new NotFoundError("Comment");
    if (comment.createdBy.toString() !== userId) {
      throw new UnauthorizedError("You can only restore your own comments");
    }
    await Comment.findByIdAndUpdate(commentId, {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    });
    return await Comment.findById(commentId);
  }

  private async enrichComment(comment: any) {
    const reactions = comment.reactions || [];
    const summary = reactions.reduce((acc: Record<number, number>, curr: any) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {});

    const reactionSummary = Object.entries(summary).map(([type, count]) => ({
      type: Number(type),
      count,
    }));

    return {
      ...comment.toObject(),
      reactionSummary,
    };
  }

  private toTree(comments: any[]) {
    const map = new Map<string, any>();
    for (const comment of comments) {
      map.set(comment._id.toString(), { ...comment, replies: [] });
    }
    const roots: any[] = [];
    for (const comment of Array.from(map.values())) {
      if (comment.parentCommentId) {
        const parent = map.get(comment.parentCommentId.toString());
        if (parent) parent.replies.push(comment);
        else roots.push(comment);
      } else {
        roots.push(comment);
      }
    }
    return roots;
  }
}

export const commentsService = new CommentsService();
