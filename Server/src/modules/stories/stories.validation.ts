import { z } from "zod";

const objectIdSchema = z.string().length(24, "Invalid id");

export const createStorySchema = z.object({
  body: z.object({
    content: z.string().optional(),
    mediaUrl: z.string().url("Invalid media URL").optional(),
  }),
});

export const storyIdSchema = z.object({
  params: z.object({
    storyId: objectIdSchema,
  }),
});
