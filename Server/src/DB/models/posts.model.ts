import mongoose from "mongoose";
import { Comment } from "./comments.model";
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

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
  { timestamps: true, optimisticConcurrency: true, collection: "Post" },
);

applySoftDeleteQueryMiddleware(postSchema);

postSchema.pre("deleteOne", { document: true, query: false }, async function () {
  await Comment.deleteMany({ postId: this._id });
});

postSchema.pre("findOneAndDelete", async function () {
  const post = await this.model.findOne(this.getFilter()).select("_id");
  if (post?._id) {
    await Comment.deleteMany({ postId: post._id });
  }
});

export const Post = mongoose.model("Post", postSchema);
