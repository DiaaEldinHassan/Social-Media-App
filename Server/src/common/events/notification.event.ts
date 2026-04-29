import { EventEmitter } from "events";
import { User } from "../../DB/models/users.model";
import { Post } from "../../DB/models/posts.model";
import { Comment } from "../../DB/models/comments.model";
import { fcmService } from "../services/fcm.service";

export const notificationEmitter = new EventEmitter();

// Event Names
export const NOTIFICATION_EVENTS = {
  REACTION_CREATED: "reaction:created",
  COMMENT_CREATED: "comment:created",
};

// Listeners
const reactionMap: Record<number, string> = {
  1: "Like",
  2: "Love",
  3: "Laugh",
  4: "Wow",
  5: "Sad",
  6: "Angry",
};

notificationEmitter.on(
  NOTIFICATION_EVENTS.REACTION_CREATED,
  async (data: { userId: string; targetType: "post" | "comment"; targetId: string; type: number }) => {
    console.log(`[NotificationEvent] Received REACTION_CREATED for ${data.targetType} ${data.targetId}`);
    try {
      let recipientId: string | undefined;
      let targetName = "";

      if (data.targetType === "post") {
        const post = await Post.findById(data.targetId).populate("createdBy");
        recipientId = (post?.createdBy as any)?._id;
        targetName = "post";
      } else {
        const comment = await Comment.findById(data.targetId).populate("createdBy");
        recipientId = (comment?.createdBy as any)?._id;
        targetName = "comment";
      }

      if (!recipientId) {
        console.log("[NotificationEvent] Recipient not found.");
        return;
      }

      if (recipientId.toString() === data.userId) {
        console.log("[NotificationEvent] Self-reaction, skipping notification.");
        return;
      }

      const recipient = await User.findById(recipientId).select("fcmTokens username");
      const actor = await User.findById(data.userId).select("username");

      if (!recipient) {
        console.log("[NotificationEvent] Recipient user document not found.");
        return;
      }

      if (!recipient.fcmTokens || recipient.fcmTokens.length === 0) {
        console.log(`[NotificationEvent] Recipient ${recipient.username} has no FCM tokens.`);
        return;
      }

      const reactionName = reactionMap[data.type] || "a reaction";
      const title = `New ${reactionName}!`;
      const body = `${actor?.username || "Someone"} reacted with ${reactionName} to your ${targetName}.`;

      const payload = {
        title,
        body,
        data: {
          type: "reaction",
          actorId: data.userId,
          targetId: data.targetId,
          targetType: data.targetType,
          reactionType: String(data.type),
        },
      };

      for (const token of recipient.fcmTokens) {
        const result = await fcmService.sendToToken(token, payload);
        if (result.success) {
          console.log(`[NotificationEvent] FCM sent to ${recipient.username} for reaction.`);
        } else {
          console.error(`[NotificationEvent] FCM failed for ${recipient.username}:`, result.error);
        }
      }
    } catch (error) {
      console.error("[NotificationEvent] Error handling reaction created:", error);
    }
  },
);

notificationEmitter.on(
  NOTIFICATION_EVENTS.COMMENT_CREATED,
  async (data: { userId: string; postId: string; content: string; commentId: string }) => {
    console.log(`[NotificationEvent] Received COMMENT_CREATED for post ${data.postId}`);
    try {
      const post = await Post.findById(data.postId).populate("createdBy");
      const recipientId = (post?.createdBy as any)?._id;

      if (!recipientId) {
        console.log("[NotificationEvent] Post creator not found.");
        return;
      }

      if (recipientId.toString() === data.userId) {
        console.log("[NotificationEvent] Self-comment, skipping notification.");
        return;
      }

      const recipient = await User.findById(recipientId).select("fcmTokens username");
      const actor = await User.findById(data.userId).select("username");

      if (!recipient) {
        console.log("[NotificationEvent] Recipient user document not found.");
        return;
      }

      if (!recipient.fcmTokens || recipient.fcmTokens.length === 0) {
        console.log(`[NotificationEvent] Recipient ${recipient.username} has no FCM tokens.`);
        return;
      }

      const title = "New Comment!";
      const body = `${actor?.username || "Someone"} commented on your post: "${data.content.substring(0, 30)}${data.content.length > 30 ? "..." : ""}"`;

      const payload = {
        title,
        body,
        data: {
          type: "comment",
          actorId: data.userId,
          postId: data.postId,
          commentId: data.commentId,
        },
      };

      for (const token of recipient.fcmTokens) {
        const result = await fcmService.sendToToken(token, payload);
        if (result.success) {
          console.log(`[NotificationEvent] FCM sent to ${recipient.username} for comment.`);
        } else {
          console.error(`[NotificationEvent] FCM failed for ${recipient.username}:`, result.error);
        }
      }
    } catch (error) {
      console.error("[NotificationEvent] Error handling comment created:", error);
    }
  },
);
