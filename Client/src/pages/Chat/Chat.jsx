import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import Button from "../../components/common/Button/Button";
import ChatSidebar from "../../components/chat/ChatSidebar";
import ChatMessageArea from "../../components/chat/ChatMessageArea";
import { userService } from "../../services/user.service";
import {
  sendMessage, sendGroupMessage, joinChat, joinGroupChat,
  onReceiveMessage, onReceiveGroupMessage, getConversation,
  createGroup, getMyGroups, getGroupMessages,
} from "../../services/chat.service";

const Chat = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const currentUserIdRef = useRef(currentUserId);
  currentUserIdRef.current = currentUserId;
  const selectedUserRef = useRef(selectedUser);
  selectedUserRef.current = selectedUser;
  const selectedGroupRef = useRef(selectedGroup);
  selectedGroupRef.current = selectedGroup;

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload.userId);
      joinChat(payload.userId);
      loadFriends();
      loadGroups();
    }
  }, []);

  const loadGroups = async () => {
    try {
      const g = await getMyGroups();
      setGroups(g);
    } catch (err) {
      console.error("Failed to load groups:", err);
    }
  };

  // DM socket listener
  useEffect(() => {
    const cleanup = onReceiveMessage((msg) => {
      const uid = currentUserIdRef.current;
      const sel = selectedUserRef.current;
      const gSel = selectedGroupRef.current;
      if (!uid) return;
      if (gSel) return;
      setMessages((prev) => {
        const belongs =
          (String(msg.senderId) === uid && String(msg.receiverId) === sel?._id) ||
          (String(msg.senderId) === sel?._id && String(msg.receiverId) === uid);
        if (belongs) return [...prev, msg];
        if (prev.length === 0) {
          const relevant = String(msg.senderId) === uid || String(msg.receiverId) === uid;
          if (relevant) return [...prev, msg];
        }
        return prev;
      });
    });
    return cleanup;
  }, []);

  // Group socket listener
  useEffect(() => {
    const cleanup = onReceiveGroupMessage((msg) => {
      const gSel = selectedGroupRef.current;
      if (!gSel) return;
      setMessages((prev) => {
        if (String(msg.groupId) === String(gSel._id)) {
          return [...prev, msg];
        }
        return prev;
      });
    });
    return cleanup;
  }, []);

  // Load DM conversation when user is selected
  useEffect(() => {
    if (!selectedUser?._id || !currentUserId || selectedGroup) return;
    setMessages([]);
    setMessagesLoading(true);
    getConversation(selectedUser._id)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setMessagesLoading(false));
  }, [selectedUser?._id, currentUserId, selectedGroup]);

  // Load group messages when group is selected
  useEffect(() => {
    if (!selectedGroup?._id || !currentUserId) return;
    setMessages([]);
    setMessagesLoading(true);
    joinGroupChat(selectedGroup._id);
    getGroupMessages(selectedGroup._id)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setMessagesLoading(false));
  }, [selectedGroup?._id, currentUserId]);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const data = await userService.getFriends();
      setFriends(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedGroup(null);
    setShowSidebar(false);
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
    setShowSidebar(false);
  };

  const handleBack = () => {
    setShowSidebar(true);
  };

  const handleReply = (msg) => {
    setReplyTo({
      messageId: msg._id,
      message: msg.message,
      senderName: msg.senderName || "Unknown",
      senderId: msg.senderId,
    });
  };

  const clearReply = () => setReplyTo(null);

  const handleSend = () => {
    if (!message.trim() || !currentUserId) return;
    if (!selectedUser && !selectedGroup) return;
    const reply = replyTo
      ? { messageId: replyTo.messageId, message: replyTo.message, senderName: replyTo.senderName }
      : undefined;

    if (selectedGroup) {
      const mentions = [];
      const mentionRegex = /@(\w+)/g;
      let match;
      while ((match = mentionRegex.exec(message)) !== null) {
        const member = selectedGroup.members?.find(
          (m) => m.userId?.username === match[1],
        );
        if (member) mentions.push(member.userId._id);
      }
      sendGroupMessage(message, currentUserId, selectedGroup._id, reply, mentions.length > 0 ? mentions : undefined);
    } else {
      sendMessage(message, currentUserId, selectedUser._id, reply);
    }
    setMessage("");
    setReplyTo(null);
  };

  const handleGroupCreated = async (name, description, memberIds) => {
    try {
      const group = await createGroup(name, description, memberIds);
      await loadGroups();
      return group;
    } catch (err) {
      console.error("Failed to create group:", err);
    }
  };

  if (!token) {
    return (
      <div className="page-shell animate-fade-in">
        <div className="glass-card" style={{ padding: "3rem", maxWidth: "400px", width: "100%", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
            <User size={48} style={{ color: "#64748b" }} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>Sign in Required</h2>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>Please sign in to use the chat.</p>
          <Button onClick={() => navigate("/login")}>Go to Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in md:p-4 p-0">
      <div
        className="flex w-full max-w-[1100px] h-dvh md:h-[calc(100vh-2rem)] md:max-h-[800px] overflow-hidden md:rounded-2xl md:border md:border-white/10"
        style={{ background: "#0f172a", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}
      >
        <div className={`${showSidebar ? "flex" : "hidden"} md:flex w-full md:w-auto`}>
          <ChatSidebar
            friends={friends}
            selectedUser={selectedUser}
            selectedGroup={selectedGroup}
            groups={groups}
            search={search}
            onSearchChange={setSearch}
            onSelectUser={handleSelectUser}
            onSelectGroup={handleSelectGroup}
            onGroupCreated={handleGroupCreated}
            loading={loading}
            error={error}
            onNavigate={navigate}
            onClose={() => setShowSidebar(false)}
          />
        </div>

        <div className={`${!showSidebar || selectedUser || selectedGroup ? "flex" : "hidden"} md:flex flex-1`}>
          <ChatMessageArea
            selectedUser={selectedUser}
            selectedGroup={selectedGroup}
            messages={messages}
            currentUserId={currentUserId}
            messagesLoading={messagesLoading}
            message={message}
            onMessageChange={setMessage}
            onSend={handleSend}
            replyTo={replyTo}
            onClearReply={clearReply}
            onReply={handleReply}
            onBack={handleBack}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
