import { useState, useRef, useEffect } from "react";
import { Send, Smile, X, CornerDownRight } from "lucide-react";

const MessageInput = ({ value, onChange, onSend, replyTo, onClearReply, isGroup, groupMembers, currentUserId }) => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionIndex, setMentionIndex] = useState(-1);
  const inputRef = useRef(null);

  const members = (groupMembers || [])
    .map((m) => m.userId)
    .filter((u) => u && String(u._id) !== String(currentUserId));

  useEffect(() => {
    if (!isGroup || !value) {
      setShowMentions(false);
      return;
    }
    const cursorPos = inputRef.current?.selectionStart || value.length;
    const textBefore = value.slice(0, cursorPos);
    const atMatch = textBefore.match(/@(\w*)$/);
    if (atMatch) {
      setMentionSearch(atMatch[1].toLowerCase());
      setShowMentions(true);
      setMentionIndex(0);
    } else {
      setShowMentions(false);
    }
  }, [value, isGroup]);

  const insertMention = (username) => {
    const cursorPos = inputRef.current?.selectionStart || value.length;
    const textBefore = value.slice(0, cursorPos);
    const textAfter = value.slice(cursorPos);
    const atMatch = textBefore.match(/@(\w*)$/);
    if (atMatch) {
      const newText = textBefore.slice(0, atMatch.index) + `@${username} ` + textAfter;
      onChange(newText);
      setShowMentions(false);
      inputRef.current?.focus();
    }
  };

  const filteredMembers = members.filter((u) =>
    u.username?.toLowerCase().includes(mentionSearch),
  );

  const handleKeyDown = (e) => {
    if (showMentions && filteredMembers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((prev) => (prev + 1) % filteredMembers.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        if (mentionIndex >= 0 && mentionIndex < filteredMembers.length) {
          e.preventDefault();
          insertMention(filteredMembers[mentionIndex].username);
          return;
        }
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(15,23,42,0.8)",
        position: "relative",
      }}
    >
      {replyTo && (
        <div className="flex items-center gap-2 px-3 sm:px-4 pt-2">
          <div
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: "rgba(30,41,59,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderLeft: "3px solid #7c3aed",
            }}
          >
            <CornerDownRight size={13} color="#a78bfa" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="text-[11px] font-semibold" style={{ color: "#a78bfa" }}>
                {replyTo.senderName}
              </div>
              <div
                className="text-xs truncate"
                style={{ color: "#64748b" }}
              >
                {replyTo.message}
              </div>
            </div>
          </div>
          <button
            onClick={onClearReply}
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150"
            style={{ border: "none", background: "transparent", color: "#64748b", cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#e2e8f0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Mention autocomplete dropdown */}
      {showMentions && filteredMembers.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "1rem",
            right: "1rem",
            maxHeight: "200px",
            overflowY: "auto",
            background: "#1e293b",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            boxShadow: "0 -8px 30px rgba(0,0,0,0.4)",
            zIndex: 50,
            padding: "0.375rem",
          }}
        >
          {filteredMembers.map((u, i) => (
            <div
              key={u._id}
              onClick={() => insertMention(u.username)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.625rem",
                borderRadius: "8px",
                cursor: "pointer",
                background: i === mentionIndex ? "rgba(139,92,246,0.15)" : "transparent",
                color: i === mentionIndex ? "#a78bfa" : "#e2e8f0",
                fontSize: "13px",
              }}
              onMouseEnter={() => setMentionIndex(i)}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "9px",
                  fontWeight: "600",
                }}
              >
                {u.username?.charAt(0).toUpperCase() || "?"}
              </div>
              @{u.username}
            </div>
          ))}
        </div>
      )}

      <div className="p-3 sm:p-4">
        <div className="flex gap-2 items-center">
          <div style={{ flex: 1, position: "relative" }}>
            <input
              ref={inputRef}
              placeholder={replyTo ? "Write a reply..." : isGroup ? "Type a message... @ to mention" : "Message"}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-full text-sm rounded-xl outline-none transition-all duration-200"
              style={{
                padding: "0.625rem 1rem",
                background: "rgba(30,41,59,0.8)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#e2e8f0",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(139,92,246,0.3)";
                e.target.style.background = "rgba(30,41,59,0.95)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.06)";
                e.target.style.background = "rgba(30,41,59,0.8)";
              }}
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-150"
              style={{ border: "none", background: "transparent", color: "#475569", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Smile size={17} />
            </button>
          </div>
          <button
            onClick={onSend}
            disabled={!value.trim()}
            className="w-[38px] h-[38px] rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
            style={{
              border: "none",
              cursor: value.trim() ? "pointer" : "not-allowed",
              ...(value.trim()
                ? {
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    color: "white",
                    boxShadow: "0 4px 16px rgba(109,40,217,0.35)",
                  }
                : {
                    background: "rgba(30,41,59,0.8)",
                    color: "#475569",
                  }),
            }}
            onMouseEnter={(e) => {
              if (value.trim()) {
                e.currentTarget.style.background = "linear-gradient(135deg, #8b5cf6, #7c3aed)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(109,40,217,0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (value.trim()) {
                e.currentTarget.style.background = "linear-gradient(135deg, #7c3aed, #6d28d9)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(109,40,217,0.35)";
              }
            }}
            onMouseDown={(e) => { if (value.trim()) e.currentTarget.style.transform = "scale(0.92)"; }}
            onMouseUp={(e) => { if (value.trim()) e.currentTarget.style.transform = "scale(1)"; }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
