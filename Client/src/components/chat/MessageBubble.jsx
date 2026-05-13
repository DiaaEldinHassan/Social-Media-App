import { useState } from "react";
import { Reply, CornerDownRight } from "lucide-react";

const MessageBubble = ({ message, isMine, showAvatar, username, userPalette, isGroup, onReply }) => {
  const [hovered, setHovered] = useState(false);

  const fmt = (s) =>
    new Date(s).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const renderMessage = (text) => {
    if (!text) return null;
    const mentionRegex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(
        <span
          key={match.index}
          style={{
            color: "#a78bfa",
            fontWeight: "600",
            background: "rgba(139,92,246,0.12)",
            borderRadius: "4px",
            padding: "0 3px",
          }}
        >
          {match[0]}
        </span>,
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        marginTop: showAvatar ? "14px" : "3px",
        alignItems: isMine ? "flex-end" : "flex-start",
        animation: "fadeInUp 0.25s ease-out",
        width: "100%",
      }}
    >
      {/* Sender name + avatar row */}
      {showAvatar && !isMine && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem", marginLeft: "0.25rem" }}>
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${userPalette?.from || "#8b5cf6"}, ${userPalette?.to || "#6d28d9"})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "8px",
              fontWeight: "700",
              boxShadow: `0 2px 6px ${userPalette?.shadow || "rgba(139,92,246,0.3)"}`,
              border: "1.5px solid rgba(255,255,255,0.1)",
            }}
          >
            {username?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}>{username}</span>
        </div>
      )}

      {/* Bubble row: reply btn + bubble, or bubble + reply btn */}
      <div
        style={{
          display: "flex",
          maxWidth: "80%",
          flexDirection: isMine ? "row-reverse" : "row",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {/* Spacer for non-first messages on the left side */}
        {!isMine && !showAvatar && !isGroup && <div style={{ width: "6px", flexShrink: 0 }} />}

        {/* Message bubble */}
        <div
          style={{
            padding: message.replyTo ? "6px 18px 10px" : "10px 18px",
            lineHeight: "1.5",
            overflow: "hidden",
            overflowWrap: "break-word",
            wordBreak: "break-word",
            transition: "transform 0.15s",
            borderRadius: isMine ? "20px 4px 20px 20px" : "4px 20px 20px 20px",
            ...(isMine
              ? {
                  background: "linear-gradient(140deg, #7c3aed 0%, #6d28d9 60%, #5b21b6 100%)",
                  color: "white",
                  boxShadow: "0 4px 20px rgba(109,40,217,0.4), 0 2px 6px rgba(92,30,200,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
                }
              : {
                  background: "rgba(30,41,59,0.9)",
                  color: "#e2e8f0",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
                }),
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.01)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {/* Reply-to preview */}
          {message.replyTo && (
            <div
              style={{
                marginBottom: "6px",
                padding: "6px 10px",
                borderRadius: "8px",
                borderLeft: `3px solid ${isMine ? "rgba(255,255,255,0.5)" : "#7c3aed"}`,
                background: "rgba(0,0,0,0.15)",
                fontSize: "12px",
              }}
            >
              <div style={{ fontWeight: "600", fontSize: "11px", marginBottom: "2px", color: isMine ? "rgba(255,255,255,0.8)" : "#a78bfa" }}>
                <CornerDownRight size={11} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
                {message.replyTo.senderName}
              </div>
              <div style={{ opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {message.replyTo.message}
              </div>
            </div>
          )}

          <span style={{ whiteSpace: "pre-wrap", fontSize: "14px" }}>{renderMessage(message.message)}</span>

          {/* Timestamp + read tick */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              justifyContent: "flex-end",
              marginTop: "0.25rem",
              marginBottom: "-2px",
              color: isMine ? "rgba(255,255,255,0.45)" : "rgba(100,116,139,0.8)",
            }}
          >
            <span style={{ fontSize: "10px", fontWeight: "500" }}>{fmt(message.createdAt)}</span>
            {isMine && (
              <svg width="14" height="9" viewBox="0 0 14 9" fill="none" style={{ opacity: 0.5 }}>
                <path d="M1 4.5L4.5 8L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>

        {/* Reply button — always in flex flow, shown on hover */}
        <button
          onClick={(e) => { e.stopPropagation(); onReply?.(); }}
          style={{
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? "auto" : "none",
            transition: "opacity 0.15s ease, transform 0.15s ease",
            transform: hovered ? "scale(1)" : "scale(0.8)",
            flexShrink: 0,
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "#1e293b",
            color: "#94a3b8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#cbd5e1";
            e.currentTarget.style.background = "#263548";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#94a3b8";
            e.currentTarget.style.background = "#1e293b";
          }}
        >
          <Reply size={13} />
        </button>
      </div>
    </div>
  );
};

export default MessageBubble;
