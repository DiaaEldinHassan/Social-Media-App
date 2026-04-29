import { Post } from "../../DB/models/posts.model";
import { Comment } from "../../DB/models/comments.model";

class FeedService {
  async getFeed(page = 1, limit = 20) {
    const posts = await Post.find()
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
