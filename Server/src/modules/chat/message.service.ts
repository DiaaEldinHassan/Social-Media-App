import { Message } from "../../DB/models/message.model";

class MessageService {
  async saveMessage(
    senderId: string,
    receiverId: string,
    message: string,
    replyTo?: { messageId: string; message: string; senderName: string },
  ) {
    const data: any = { senderId, receiverId, message };
    if (replyTo) data.replyTo = replyTo;
    const msg = await Message.create(data);
    return msg;
  }

  async getConversation(userId1: string, userId2: string, page = 1, limit = 50) {
    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return messages.reverse();
  }
}

export const messageService = new MessageService();
