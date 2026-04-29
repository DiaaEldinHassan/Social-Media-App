import { Story } from "../../DB/models/stories.model";
import { NotFoundError, UnauthorizedError } from "../../common/utils/error.utils";

class StoriesService {
  async createStory(userId: string, data: { content?: string; mediaUrl?: string }) {
    return Story.create({
      createdBy: userId,
      content: data.content ?? "",
      mediaUrl: data.mediaUrl ?? "",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }

  async listActiveStories() {
    return Story.find({ expiresAt: { $gt: new Date() } })
      .populate("createdBy", "username profilePicture")
      .sort({ createdAt: -1 });
  }

  async deleteStory(userId: string, storyId: string) {
    const story = await Story.findById(storyId);
    if (!story) throw new NotFoundError("Story");
    if (story.createdBy.toString() !== userId) {
      throw new UnauthorizedError("You can only delete your own stories");
    }
    await Story.findByIdAndUpdate(storyId, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
    });
    return { message: "Story soft deleted successfully" };
  }

  async hardDeleteStory(userId: string, storyId: string) {
    const story = await Story.findById(storyId, null, { withDeleted: true } as any);
    if (!story) throw new NotFoundError("Story");
    if (story.createdBy.toString() !== userId) {
      throw new UnauthorizedError("You can only delete your own stories");
    }
    await Story.findByIdAndDelete(storyId);
    return { message: "Story hard deleted successfully" };
  }
}

export const storiesService = new StoriesService();
