import { z } from "zod";

const objectIdSchema = z.string().length(24, "Invalid id");

export const upsertReactionSchema = z.object({
  body: z.object({
    targetType: z.enum(["post", "comment"]),
    targetId: objectIdSchema,
    type: z.number().int().min(1).max(6),
  }),
});

export const removeReactionSchema = z.object({
  params: z.object({
    targetType: z.enum(["post", "comment"]),
    targetId: objectIdSchema,
  }),
});
