import mongoose from "mongoose";
import { applySoftDeleteQueryMiddleware } from "./softDelete.utils";

const reactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6], 
      required: true,
    },
  },
  { _id: false },
);

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    rootCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reactions: {
      type: [reactionSchema],
      default: [],
    },
  },
  { timestamps: true, optimisticConcurrency: true, collection: "Comment" },
);

applySoftDeleteQueryMiddleware(commentSchema);

export const Comment = mongoose.model("Comment", commentSchema);
