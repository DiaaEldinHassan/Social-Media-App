import { Post } from "../../DB/models/posts.model";
import { Comment } from "../../DB/models/comments.model";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../common/utils/error.utils";

class PostsService {
  async createPost(data: { title: string; content: string; userId: string }) {
    return await Post.create({
      title: data.title,
      content: data.content,
      createdBy: data.userId,
    });
  }

  async listPosts(options: {
    authorId?: string;
    page?: number;
    limit?: number;
    withDeleted?: boolean;
  }) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const filter = options.authorId ? { createdBy: options.authorId } : {};
    const posts = await Post.find(filter, null, {
      withDeleted: options.withDeleted ?? false,
    } as any)
      .populate("createdBy", "username email profilePicture")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return Promise.all(posts.map((post) => this.enrichPost(post)));
  }

  async getPostById(postId: string, withDeleted = false) {
    const post = await Post.findById(postId, null, { withDeleted } as any).populate(
      "createdBy",
      "username email profilePicture",
    );
    if (!post) throw new NotFoundError("Post");
    return this.enrichPost(post);
  }

  async updatePost(
    postId: string,
    userId: string,
    data: { title?: string; content?: string },
  ) {
    if (!data.title && !data.content) {
      throw new BadRequestError("Please provide title or content to update");
    }

    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError("Post");
    }

    if (post.createdBy.toString() !== userId) {
      throw new UnauthorizedError("You can only update your own posts");
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!updatedPost) throw new NotFoundError("Post");
    return updatedPost;
  }

  async deletePost(postId: string, userId: string) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError("Post");
    }

    if (post.createdBy.toString() !== userId) {
      throw new UnauthorizedError("You can only delete your own posts");
    }

    await Post.findByIdAndUpdate(postId, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
    });
    await Comment.updateMany(
      { postId },
      { isDeleted: true, deletedAt: new Date(), deletedBy: userId },
    );
    return { message: "Post soft deleted successfully" };
  }

  async hardDeletePost(postId: string, userId: string) {
    const post = await Post.findById(postId, null, { withDeleted: true } as any);
    if (!post) throw new NotFoundError("Post");
    if (post.createdBy.toString() !== userId) {
      throw new UnauthorizedError("You can only hard delete your own posts");
    }
    await Post.findByIdAndDelete(postId);
    return { message: "Post hard deleted successfully" };
  }

  async restorePost(postId: string, userId: string) {
    const post = await Post.findById(postId, null, { withDeleted: true } as any);
    if (!post) throw new NotFoundError("Post");
    if (post.createdBy.toString() !== userId) {
      throw new UnauthorizedError("You can only restore your own posts");
    }
    await Post.findByIdAndUpdate(postId, {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    });
    await Comment.updateMany(
      { postId },
      { isDeleted: false, deletedAt: null, deletedBy: null },
    );
    return await Post.findById(postId);
  }

  private async enrichPost(post: any) {
    const commentsCount = await Comment.countDocuments({ postId: post._id });
    
    const reactions = post.reactions || [];
    const summary = reactions.reduce((acc: Record<number, number>, curr: any) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {});

    const reactionSummary = Object.entries(summary).map(([type, count]) => ({
      type: Number(type),
      count,
    }));

    return {
      ...post.toObject(),
      commentsCount,
      reactionSummary,
      reactions,
    };
  }
}

export const postsService = new PostsService();
