import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; 
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];

export const profilePicSchema = z.object({
  file: z
    .any()
    .refine((file) => file !== undefined, "File is required")
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Max Image Size 5 MB")
    .refine(
      (file) => ACCEPTED_TYPES.includes(file?.mimetype),
      "Only .jpg, .png, and .webp formats are supported",
    ),
});

export const updateUserDataSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters long")
      .optional(),
    bio: z.string().optional(),
    profilePicture: z.string().optional(),
  })
  .strict();

export const videoSchema = z.object({
  file: z
    .any()
    .refine((file) => file !== undefined, "File is required")
    .refine((file) => file?.size > MAX_FILE_SIZE, "Size Must Be More Than 5MB")
    .refine(
      (file) => ACCEPTED_VIDEO_TYPES.includes(file?.mimetype),
      "Only .mp4, .webm and .ogg formats are supported.",
    ),
});

export const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().length(24, "Invalid user id"),
  }),
});

export const registerFcmTokenSchema = z.object({
  body: z.object({
    token: z.string().min(10, "Invalid FCM token"),
  }),
});
