import { useRef, useEffect } from "react";
import { MoreVertical, Phone, Video, MessageCircle, ArrowLeft, Users } from "lucide-react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

const PALETTES = [
  { from: "#8b5cf6", to: "#6d28d9", shadow: "rgba(139,92,246,0.3)" },
  { from: "#3b82f6", to: "#1d4ed8", shadow: "rgba(59,130,246,0.3)" },
  { from: "#10b981", to: "#047857", shadow: "rgba(16,185,129,0.3)" },
  { from: "#f43f5e", to: "#be123c", shadow: "rgba(244,63,94,0.3)" },
  { from: "#f59e0b", to: "#b45309", shadow: "rgba(245,158,11,0.3)" },
  { from: "#06b6d4", to: "#0e7490", shadow: "rgba(6,182,212,0.3)" },
  { from: "#ec4899", to: "#9d174d", shadow: "rgba(236,72,153,0.3)" },
  { from: "#6366f1", to: "#4338ca", shadow: "rgba(99,102,241,0.3)" },
];
const pickPalette = (id) => PALETTES[String(id).length % PALETTES.length];

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const dayLabel = (d) => {
  const now = new Date();
  const yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  if (sameDay(d, now)) return "Today";
  if (sameDay(d, yest)) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const ChatMessageArea = ({
  selectedUser,
  selectedGroup,
  messages,
  currentUserId,
  messagesLoading,
  message,
  onMessageChange,
  onSend,
  replyTo,
  onClearReply,
  onReply,
  onBack,
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isGroupChat = !!selectedGroup;
  const palette = isGroupChat
    ? pickPalette(selectedGroup._id)
    : selectedUser
      ? pickPalette(selectedUser._id)
      : null;

  const findSenderName = (msg) => {
    if (String(msg.senderId) === String(currentUserId)) return "You";
    if (isGroupChat && msg.senderId?.username) return msg.senderId.username;
    return selectedUser?.name || "Unknown";
  };

  const findSenderPalette = (msg) => {
    if (isGroupChat && msg.senderId?._id) {
      return pickPalette(msg.senderId._id);
    }
    return palette;
  };

  const getHeaderName = () => {
    if (isGroupChat) return selectedGroup.name;
    return selectedUser?.name || "";
  };

  const getHeaderSubtext = () => {
    if (isGroupChat) {
      const count = selectedGroup.members?.length || 0;
      return `${count} member${count !== 1 ? "s" : ""}`;
    }
    return "Online";
  };

  if (!selectedUser && !selectedGroup) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center select-none"
        style={{ background: "#0f172a", gap: "0.75rem" }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MessageCircle size={30} color="#334155" />
        </div>
        <div style={{ textAlign: "center" }}>
          <p className="text-sm font-medium" style={{ color: "#64748b" }}>Chat App</p>
          <p className="text-xs sm:text-sm mt-1.5 max-w-[200px] leading-relaxed" style={{ color: "#334155" }}>
            Select a conversation or group to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0" style={{ background: "#0f172a" }}>
      <div
        className="flex items-center justify-between px-3 md:px-5 py-2.5 md:py-2.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(15,23,42,0.8)" }}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={onBack}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: "#64748b" }}
          >
            <ArrowLeft size={18} />
          </button>
          <div
            style={{
              width: "34px",
              height: "34px",
              minWidth: "34px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              color: "white",
              fontSize: "13px",
              fontWeight: "600",
              boxShadow: `0 4px 12px ${palette.shadow}`,
            }}
          >
            {isGroupChat ? (
              <Users size={16} />
            ) : selectedUser?.avatar ? (
              <img src={selectedUser.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              getHeaderName().charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: "#f1f5f9" }}>{getHeaderName()}</div>
            <div className="flex items-center gap-1.5 mt-px">
              {!isGroupChat && (
                <div
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#10b981",
                    boxShadow: "0 0 6px rgba(16,185,129,0.4)",
                  }}
                />
              )}
              <span className="text-[11px] font-medium" style={{ color: "#64748b" }}>{getHeaderSubtext()}</span>
            </div>
          </div>
        </div>
        {!isGroupChat && (
          <div className="flex items-center gap-0.5">
            {[Phone, Video, MoreVertical].map((Icon, i) => (
              <button
                key={i}
                className="w-8 h-8 md:w-[34px] md:h-[34px] rounded-lg flex items-center justify-center transition-all duration-150"
                style={{ border: "none", background: "transparent", color: "#64748b", cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#94a3b8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {messagesLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div
              style={{
                width: "24px",
                height: "24px",
                border: "2px solid rgba(139,92,246,0.2)",
                borderTopColor: "#7c3aed",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span className="text-xs sm:text-sm" style={{ color: "#475569" }}>Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.03)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <p className="text-xs sm:text-sm font-medium" style={{ color: "#475569" }}>No messages here yet</p>
              <p className="text-[11px] sm:text-xs mt-1" style={{ color: "#334155" }}>
                {isGroupChat ? "Send the first message to the group" : "Send a message to start the conversation"}
              </p>
            </div>
          </div>
        ) : (
          (() => {
            const grouped = [];
            let lastDate = null;
            messages.forEach((msg, i) => {
              const d = dayLabel(new Date(msg.createdAt));
              if (d !== lastDate) {
                grouped.push({ type: "date", label: d, key: `d-${i}` });
                lastDate = d;
              }
              const prev = i > 0 ? messages[i - 1] : null;
              const showAvatar = !prev || String(prev.senderId?._id || prev.senderId) !== String(msg.senderId?._id || msg.senderId);
              const senderName = findSenderName(msg);
              const m = { ...msg, senderName };
              grouped.push({ type: "msg", msg: m, showAvatar, key: msg._id || i });
            });
            return grouped.map((item) =>
              item.type === "date" ? (
                <div key={item.key} className="flex justify-center my-3 first:mt-0">
                  <span
                    className="text-[11px] font-medium px-3 py-1 rounded-full select-none"
                    style={{
                      color: "#475569",
                      background: "rgba(30,41,59,0.6)",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ) : (
                <MessageBubble
                  key={item.key}
                  message={item.msg}
                  isMine={String(item.msg.senderId?._id || item.msg.senderId) === String(currentUserId)}
                  showAvatar={item.showAvatar}
                  username={isGroupChat ? item.msg.senderName : (selectedUser?.name || "")}
                  userPalette={isGroupChat ? findSenderPalette(item.msg) : palette}
                  isGroup={isGroupChat}
                  onReply={() => onReply(item.msg)}
                />
              )
            );
          })()
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        value={message}
        onChange={onMessageChange}
        onSend={onSend}
        replyTo={replyTo}
        onClearReply={onClearReply}
        isGroup={isGroupChat}
        groupMembers={isGroupChat ? selectedGroup.members : []}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default ChatMessageArea;
