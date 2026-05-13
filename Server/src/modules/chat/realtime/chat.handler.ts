import { Server, Socket } from "socket.io";
import { messageService } from "../message.service";
import { groupService } from "../group.service";

export const chatHandler = (io: Server, socket: Socket) => {
  socket.on("join", (userId: string) => {
    socket.join(`user:${userId}`);
  });

  socket.on("message", async (data: any) => {
    try {
      const msg = await messageService.saveMessage(
        data.senderId,
        data.receiverId,
        data.message,
        data.replyTo,
      );
      io.to(`user:${data.receiverId}`).emit("receive_message", msg);
      socket.emit("receive_message", msg);
    } catch (err) {
      console.error("Socket message error:", err);
    }
  });

  socket.on("join_group", (groupId: string) => {
    socket.join(`group:${groupId}`);
  });

  socket.on("group_message", async (data: any) => {
    try {
      const msg = await groupService.saveGroupMessage(
        data.senderId,
        data.groupId,
        data.message,
        data.replyTo,
        data.mentions,
      );
      const populated = await groupService.getGroupMessages(data.groupId, 1, 1);
      const fullMsg = populated.length > 0 ? populated[0] : msg;
      io.to(`group:${data.groupId}`).emit("receive_group_message", fullMsg);
    } catch (err) {
      console.error("Socket group_message error:", err);
    }
  });
};
