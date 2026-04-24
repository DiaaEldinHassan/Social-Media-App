import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const profilePicSchema = z.object({
  file: z.any()
    .refine((file) => file !== undefined, "File is required")
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Max Image Size 5 MB")
    .refine(
      (file) => ACCEPTED_TYPES.includes(file?.mimetype),
      "Only .jpg, .png, and .webp formats are supported"
    )
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
