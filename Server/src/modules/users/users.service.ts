import { User } from "../../DB/models/users.model";
import { Post } from "../../DB/models/posts.model";
import { Comment } from "../../DB/models/comments.model";
import { Story } from "../../DB/models/stories.model";
import { redisService } from "../../common/services/redis.service";
import { IUser, s3Service } from "../../common";
import { S3Service } from "../../common";
import {
  AppError,
  BadRequestError,
  NotFoundError,
} from "../../common/utils/error.utils";

class UsersService {
  private readonly s3: S3Service;
  constructor() {
    this.s3 = s3Service;
  }

  async getUserData(userId: string) {
    try {
      const user = await User.findById(userId).select("-password -__v");
      if (!user) {
        throw new NotFoundError("User");
      }
      return user;
    } catch (error) {
      console.error("Get user data failed:", error);
      const message =
        error instanceof Error ? error.message : "Get User Data Error";
      if (error instanceof AppError) throw error;
      throw new BadRequestError(message);
    }
  }

  async getPublicUserData(userId: string) {
    const user = await User.findById(userId).select("-password -__v");
    if (!user) throw new NotFoundError("User");
    return user;
  }

  async updateUserData(userId: string, data: any) {
    try {
      const { password, role, provider, email, ...updateData } = data;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true },
      ).select("-password -__v");

      if (!user) {
        throw new NotFoundError("User");
      }
      return user;
    } catch (error) {
      console.error("Update user data failed:", error);
      const message =
        error instanceof Error ? error.message : "Update User Data Error";
      if (error instanceof AppError) throw error;
      throw new BadRequestError(message);
    }
  }

  async confirmOtp(email: string, otp: string) {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const storedOtp = await redisService.getOtp(normalizedEmail);
      if (!storedOtp || storedOtp !== otp) {
        throw new BadRequestError("Invalid or expired OTP");
      }

      const user = await User.findOneAndUpdate(
        { email: normalizedEmail },
        { $set: { confirmed: true } },
        { new: true },
      );

      if (!user) {
        throw new NotFoundError("User");
      }

      await redisService.deleteOtp(normalizedEmail);
      return user;
    } catch (error) {
      console.error("Confirm OTP failed:", error);
      const message =
        error instanceof Error ? error.message : "Confirm OTP Error";
      if (error instanceof AppError) throw error;
      throw new BadRequestError(message);
    }
  }

  async profilePic(file: Express.Multer.File, userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    user.profilePicture = await this.s3.uploadFile({
      file,
      path: `Users/${user._id}/Profile`,
      fileName: `profile-picture`,
    });
    await user.save();
    return user.profilePicture;
  }

  async uploadLargeData(
    file: Express.Multer.File,
    userId: string,
  ): Promise<any> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError("User");
    }
    const upload = await this.s3.uploadLargeFiles({
      file,
      path: `Users/${user._id}/User_Attachments`,
    });
    return {
      message: "File uploaded successfully",
      url: upload,
    };
  }

  async presignedLinkUpload(
    {
      ContentType,
      OriginalName,
    }: { ContentType: string; OriginalName: string },
    user: IUser,
  ): Promise<{ message: string; data: { url: string; key: string } }> {
    try {
      const { url, key } = await this.s3.createPresignedUploadLink({
        ContentType,
        originalName: OriginalName,
        path: `Users/${user.userId}/Presigned_Link_Uploads`,
      });
      return {
        message: "Presigned Link Sent Successfully",
        data: { url, key },
      };
    } catch (error) {
      throw new BadRequestError("Presigned Link Error");
    }
  }

  async getUserFile(key: string) {
    try {
      return await this.s3.getFile({ Key: key });
    } catch (error) {
      console.error("Get User File Error:", error);
      throw new BadRequestError("Get User File Error");
    }
  }

  async deleteUserFile(key: string, userId: string) {
    try {
      console.log(`Attempting to delete file: ${key} for user: ${userId}`);

      if (!key.includes(`Users/${userId}/`)) {
        console.error(
          `Unauthorized deletion attempt: key ${key} doesn't belong to user ${userId}`,
        );
        throw new BadRequestError("Unauthorized to delete this file");
      }

      console.log(`Authorization check passed, deleting file: ${key}`);
      await this.s3.deleteFile({ Key: key });
      console.log(`File deleted successfully: ${key}`);
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError("User");
      }
        await User.findByIdAndUpdate(userId, { profilePicture: "" });
      return { message: "File deleted successfully" };
    } catch (error) {
      console.error("Delete User File Error:", error);
      if (error instanceof AppError) throw error;
      throw new BadRequestError("Delete User File Error");
    }
  }

  async registerFcmToken(userId: string, token: string) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { fcmTokens: token } },
      { new: true },
    ).select("-password -__v");
    if (!user) throw new NotFoundError("User");
    return user;
  }

  async listUserPosts(userId: string, page = 1, limit = 20) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User");
    return await Post.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", "username email profilePicture");
  }

  async deleteMyAccount(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User");
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.deletedBy = userId as any;
    await user.save();
    await Promise.all([
      Post.updateMany({ createdBy: userId }, { isDeleted: true, deletedAt: new Date(), deletedBy: userId }),
      Comment.updateMany({ createdBy: userId }, { isDeleted: true, deletedAt: new Date(), deletedBy: userId }),
      Story.updateMany({ createdBy: userId }, { isDeleted: true, deletedAt: new Date(), deletedBy: userId }),
      Post.updateMany({}, { $pull: { reactions: { userId } } }),
      Comment.updateMany({}, { $pull: { reactions: { userId } } }),
    ]);
    return { message: "User soft deleted successfully" };
  }

  async restoreMyAccount(userId: string) {
    const user = await User.findById(userId, null, { withDeleted: true } as any);
    if (!user) throw new NotFoundError("User");
    await User.findByIdAndUpdate(userId, {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    });
    return await User.findById(userId);
  }

  async hardDeleteMyAccount(userId: string) {
    const user = await User.findById(userId, null, { withDeleted: true } as any);
    if (!user) throw new NotFoundError("User");
    await User.findByIdAndDelete(userId);
    await redisService.revokeAllUserTokens(userId);
    return { message: "User hard deleted successfully" };
  }
}

export const usersService = new UsersService();
