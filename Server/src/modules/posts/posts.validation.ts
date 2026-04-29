import { z } from "zod";

const objectIdSchema = z.string().length(24, "Invalid id");

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    content: z.string().min(1, "Post content is required"),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters long").optional(),
    content: z.string().min(1, "Post content is required").optional(),
  }),
  params: z.object({
    postId: objectIdSchema,
  }),
});

export const postIdParamSchema = z.object({
  params: z.object({
    postId: objectIdSchema,
  }),
});

export const listPostsSchema = z.object({
  query: z.object({
    authorId: objectIdSchema.optional(),
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    withDeleted: z
      .union([z.literal("true"), z.literal("false")])
      .optional(),
  }),
});
