import { Post } from "../../DB/models/posts.model";
import { Comment } from "../../DB/models/comments.model";
import { User } from "../../DB/models/users.model";

class FeedService {
  async getFeed(userId?: string, page = 1, limit = 20) {
    let filter: any = {};

    if (userId) {
      const user = await User.findById(userId).select("friends");
      const friendIds = (user?.friends || []).map((f: any) => f.friendId);
      friendIds.push(userId as any);
      filter.createdBy = { $in: friendIds };
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", "username email profilePicture");

    return Promise.all(
      posts.map(async (post) => {
        const commentsCount = await Comment.countDocuments({ postId: post._id });
        const reactionsCount = (post as any).reactions?.length || 0;
        return {
          ...post.toObject(),
          commentsCount,
          reactionsCount,
        };
      }),
    );
  }
}

export const feedService = new FeedService();
