import type { ObjectId } from "mongoose";
import { User } from "../../DB/models/users.model";
import { redisService } from "../../common/services/redis.service";
import { v2 as cloudinary } from "cloudinary";
import { uniqueNameGenerator } from "../../common";
import { cloudinaryService } from "../../common/services/cloudinary.service";
import { Readable } from "node:stream";

class UsersService {
  async getUserData(userId: string) {
    try {
      const user = await User.findById(userId).select("-password -__v");
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      console.error("Get user data failed:", error);
      throw new Error(
        error instanceof Error ? error.message : "Get User Data Error",
      );
    }
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
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      console.error("Update user data failed:", error);
      throw new Error(
        error instanceof Error ? error.message : "Update User Data Error",
      );
    }
  }

  async confirmOtp(email: string, otp: string) {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const storedOtp = await redisService.getOtp(normalizedEmail);
      if (!storedOtp || storedOtp !== otp) {
        throw new Error("Invalid or expired OTP");
      }

      const user = await User.findOneAndUpdate(
        { email: normalizedEmail },
        { $set: { confirmed: true } },
        { new: true },
      );

      if (!user) {
        throw new Error("User not found");
      }

      await redisService.deleteOtp(normalizedEmail);
      return user;
    } catch (error) {
      console.error("Confirm OTP failed:", error);
      throw new Error(
        error instanceof Error ? error.message : "Confirm OTP Error",
      );
    }
  }

  async prepareVideoUpload(userid: ObjectId): Promise<any> {
    try {
      const searchResult = await this.getFilesCount(userid);
      if (searchResult.total_count >= 4) {
        const oldestFile = searchResult.resources[0];
        await cloudinary.uploader.destroy(oldestFile.public_id);
      }

      const signatureData = await cloudinaryService.getUploadSignature(
        userid.toString(),
      );

      return signatureData;
    } catch (error) {
      console.error("Preparation failed:", error);
      throw new Error("Failed to prepare upload environment");
    }
  }
async getFilesCount(userId: ObjectId): Promise<any> {
  try {

    const userFolder = `profile_pics/${userId.toString()}`;
    
    const result = await cloudinary.search
      .expression(`folder:${userFolder}`) 
      .sort_by("created_at", "asc") 
      .execute();
      
    return result;
  } catch (error) {
    console.error("Get files count failed:", error);
    throw new Error("Get Files Count Error");
  }
}

  async prepareProfilePicUpload(
    userId: ObjectId,
    fileBuffer: any,
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const count = await this.getFilesCount(userId);
      console.log(count.total_count)
      if (count.total_count >= 4) {
        const oldestFile = count.resources[0];
        await cloudinary.uploader.destroy(oldestFile.public_id);
      }
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `profile_pics/${userId.toString()}`,
          public_id: uniqueNameGenerator(userId),
          resource_type: "auto",
        },
        async (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(new Error("Cloudinary upload failed"));
          }
          try {
            const secureUrl = result?.secure_url;
            if (!secureUrl) {
              return reject(new Error("Cloudinary did not return a secure URL"));
            }

            const updatedUser = await User.findByIdAndUpdate(
              userId,
              { $set: { profilePicture: secureUrl } },
              { new: true, runValidators: true },
            );

            if (!updatedUser) {
              return reject(new Error("User not found"));
            }

            resolve(secureUrl);
          } catch (dbError) {
            console.error("Saving profile picture URL failed:", dbError);
            reject(new Error("Failed to save profile picture"));
          }
        },
      );

      const readable = new Readable();
      readable._read = () => {};
      readable.push(fileBuffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }
}

export const usersService = new UsersService();
