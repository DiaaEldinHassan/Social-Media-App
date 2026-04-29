import mongoose from "mongoose";
import { Provider, Role, hashing } from "../../common";
import { Post } from "./posts.model";
import { Comment } from "./comments.model";
import { Story } from "./stories.model";
import { applySoftDeleteQueryMiddleware } from "./softDelete.utils";

const userPhoneSchema = new mongoose.Schema({
  encryptedPhoneNumber: {
    type: String,
    required: true,
  },
  iv: {
    type: String,
    required: true,
  },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: [userPhoneSchema],
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    provider: {
      type: String,
      default: Provider.LOCAL as string,
      enum: [Provider.GOOGLE, Provider.LOCAL],
    },
    role: {
      type: String,
      default: Role.USER as string,
      enum: [Role.USER, Role.ADMIN, Role.MODERATOR, Role.SUPER_ADMIN],
    },
    fcmTokens: {
      type: [String],
      default: [],
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
  },
  { timestamps: true, optimisticConcurrency: true, collection: "User" },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await hashing(this.password);
});

applySoftDeleteQueryMiddleware(userSchema);

const deleteUserRelations = async (userId: mongoose.Types.ObjectId): Promise<void> => {
  await Promise.all([
    Post.deleteMany({ createdBy: userId }),
    Comment.deleteMany({ createdBy: userId }),
    Post.updateMany({}, { $pull: { reactions: { userId } } }),
    Comment.updateMany({}, { $pull: { reactions: { userId } } }),
    Story.deleteMany({ createdBy: userId }),
  ]);
};

userSchema.pre("deleteOne", { document: true, query: false }, async function () {
  await deleteUserRelations(this._id);
});

userSchema.pre("findOneAndDelete", async function () {
  const user = await this.model.findOne(this.getFilter()).select("_id");
  if (user?._id) {
    await deleteUserRelations(user._id);
  }
});

export const User = mongoose.model("User", userSchema);
