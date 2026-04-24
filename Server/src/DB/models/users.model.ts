import mongoose from "mongoose";
import { Provider, Role, hashing } from "../../common";

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
  },
  { timestamps: true, optimisticConcurrency: true, collection: "User" },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await hashing(this.password);
});

export const User = mongoose.model("User", userSchema);
