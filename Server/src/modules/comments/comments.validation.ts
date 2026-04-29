import { z } from "zod";

const objectIdSchema = z.string().length(24, "Invalid id");

export const createCommentSchema = z.object({
  body: z.object({
    postId: objectIdSchema,
    content: z.string().min(1, "Comment content is required"),
    parentCommentId: objectIdSchema.optional(),
  }),
});

export const updateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Comment content is required"),
  }),
  params: z.object({
    commentId: objectIdSchema,
  }),
});

export const commentIdParamSchema = z.object({
  params: z.object({
    commentId: objectIdSchema,
  }),
});

export const postCommentsSchema = z.object({
  params: z.object({
    postId: objectIdSchema,
  }),
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    view: z.enum(["flat", "tree"]).optional(),
  }),
});
