import { Group } from "../../DB/models/group.model";
import { Message } from "../../DB/models/message.model";

class GroupService {
  async createGroup(
    name: string,
    description: string,
    createdBy: string,
    memberIds: string[],
  ) {
    const uniqueMembers = [...new Set([createdBy, ...memberIds])];
    const members = uniqueMembers.map((uid) => ({
      userId: uid,
      role: uid === createdBy ? "admin" : "member",
    }));
    const group = await Group.create({ name, description, createdBy, members });
    return group;
  }

  async getMyGroups(userId: string) {
    const groups = await Group.find({
      "members.userId": userId,
      isDeleted: { $ne: true },
    })
      .select("name description avatar createdBy members createdAt updatedAt")
      .populate("members.userId", "username email profilePicture")
      .sort({ updatedAt: -1 })
      .lean();
    return groups;
  }

  async getGroupById(groupId: string) {
    const group = await Group.findOne({
      _id: groupId,
      isDeleted: { $ne: true },
    })
      .populate("members.userId", "username email profilePicture")
      .populate("createdBy", "username email")
      .lean();
    return group;
  }

  async addMembers(groupId: string, newMemberIds: string[], addedBy: string) {
    const group = await Group.findOne({ _id: groupId, isDeleted: { $ne: true } });
    if (!group) throw new Error("Group not found");
    const isAdmin = group.members.some(
      (m) => String(m.userId) === addedBy && m.role === "admin",
    );
    if (!isAdmin) throw new Error("Only admins can add members");

    const existingIds = group.members.map((m) => String(m.userId));
    const toAdd = newMemberIds.filter((id) => !existingIds.includes(id));
    if (toAdd.length === 0) return group;

    const newMembers = toAdd.map((uid) => ({ userId: uid, role: "member" }));
    group.members.push(...(newMembers as any));
    await group.save();
    return group;
  }

  async removeMember(groupId: string, targetUserId: string, removedBy: string) {
    const group = await Group.findOne({ _id: groupId, isDeleted: { $ne: true } });
    if (!group) throw new Error("Group not found");

    const isAdmin = group.members.some(
      (m) => String(m.userId) === removedBy && m.role === "admin",
    );
    if (!isAdmin) throw new Error("Only admins can remove members");

    if (String(targetUserId) === String(group.createdBy)) {
      throw new Error("Cannot remove the group creator");
    }

    group.members = group.members.filter(
      (m) => String(m.userId) !== targetUserId,
    ) as any;
    await group.save();
    return group;
  }

  async saveGroupMessage(
    senderId: string,
    groupId: string,
    message: string,
    replyTo?: { messageId: string; message: string; senderName: string },
    mentions?: string[],
  ) {
    const data: any = { senderId, groupId, message };
    if (replyTo) data.replyTo = replyTo;
    if (mentions && mentions.length > 0) data.mentions = mentions;
    const msg = await Message.create(data);
    return msg;
  }

  async getGroupMessages(groupId: string, page = 1, limit = 50) {
    const messages = await Message.find({ groupId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("senderId", "username email profilePicture")
      .lean();
    return messages.reverse();
  }
}

export const groupService = new GroupService();
