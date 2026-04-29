import { Post } from "../../DB/models/posts.model";
import { Comment } from "../../DB/models/comments.model";
import { NotFoundError } from "../../common/utils/error.utils";
import { notificationEmitter, NOTIFICATION_EVENTS } from "../../common/events/notification.event";

class ReactionsService {
  async upsertReaction(data: {
    userId: string;
    targetType: "post" | "comment";
    targetId: string;
    type: number;
  }) {
    const isPost = data.targetType === "post";
    const document = isPost 
      ? await Post.findById(data.targetId)
      : await Comment.findById(data.targetId);
      
    if (!document) throw new NotFoundError(isPost ? "Post" : "Comment");

    if (isPost) {
      await Post.findByIdAndUpdate(data.targetId, {
        $pull: { reactions: { userId: data.userId } }
      } as any);
      await Post.findByIdAndUpdate(data.targetId, {
        $push: { reactions: { userId: data.userId, type: data.type } }
      } as any);
    } else {
      await Comment.findByIdAndUpdate(data.targetId, {
        $pull: { reactions: { userId: data.userId } }
      } as any);
      await Comment.findByIdAndUpdate(data.targetId, {
        $push: { reactions: { userId: data.userId, type: data.type } }
      } as any);
    }

    const updated = isPost 
      ? await Post.findById(data.targetId)
      : await Comment.findById(data.targetId);

    // Emit notification event
    notificationEmitter.emit(NOTIFICATION_EVENTS.REACTION_CREATED, {
      userId: data.userId,
      targetType: data.targetType,
      targetId: data.targetId,
      type: data.type,
    });

    return updated;
  }

  async removeReaction(userId: string, targetType: "post" | "comment", targetId: string) {
    const isPost = targetType === "post";
    const result = isPost
      ? await Post.findByIdAndUpdate(targetId, { $pull: { reactions: { userId } } } as any)
      : await Comment.findByIdAndUpdate(targetId, { $pull: { reactions: { userId } } } as any);
    
    if (!result) throw new NotFoundError(isPost ? "Post" : "Comment");
    
    return { message: "Reaction removed successfully" };
  }
}

export const reactionsService = new ReactionsService();
