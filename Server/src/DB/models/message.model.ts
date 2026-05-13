import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: false,
    },
    message: {
      type: String,
      required: true,
    },
    replyTo: {
      messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
      message: String,
      senderName: String,
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true, collection: "Message" },
);

export const Message = mongoose.model("Message", messageSchema);
