import { env } from "../../config/env.config";

import { v2 as cloudinary } from "cloudinary";
import { uniqueNameGenerator } from "../utils/uniqueName.utils";
import { BadRequestError } from "../utils/error.utils";

class CloudinaryService {
  async uploadImage(filePath: string, userId: string): Promise<string> {
    try {
      const uniqueName = uniqueNameGenerator(userId as any);
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: `user_uploads/${uniqueName}`,
      });
      return result.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new BadRequestError("Failed to upload image to Cloudinary");
    }
  }

  async getUploadSignature(userId: string): Promise<any> {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const uniqueFilename = uniqueNameGenerator(userId as any);
    const userFolder = `users-videos/${userId}`;

    const paramsToSign = {
      folder: userFolder,
      public_id: uniqueFilename,
      timestamp: timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      env.CLOUDINARY_API_SECRET!,
    );

    return {
      signature,
      timestamp,
      publicId: uniqueFilename,
      folder: userFolder,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      resourceType: "video",
    };
  }
}

export const cloudinaryService = new CloudinaryService();
