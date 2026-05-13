import { useState } from "react";
import { X, Users, Search } from "lucide-react";

const COLORS = [
  { from: "#8b5cf6", to: "#6d28d9" },
  { from: "#3b82f6", to: "#1d4ed8" },
  { from: "#10b981", to: "#047857" },
  { from: "#f43f5e", to: "#be123c" },
  { from: "#f59e0b", to: "#b45309" },
  { from: "#06b6d4", to: "#0e7490" },
  { from: "#ec4899", to: "#9d174d" },
  { from: "#6366f1", to: "#4338ca" },
];
const pick = (id) => COLORS[String(id).length % COLORS.length];

const CreateGroupModal = ({ friends, onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");

  const chatUsers = friends.map((f) => ({
    _id: f.friendId?._id,
    name: f.friendId?.username || "Unknown",
    avatar: f.friendId?.profilePicture,
  }));

  const filtered = chatUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleMember = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim(), selectedIds);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "420px",
          maxWidth: "90vw",
          maxHeight: "80vh",
          background: "#0f172a",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-2">
            <Users size={16} color="#a78bfa" />
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#f1f5f9" }}>
              Create Group
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "4px" }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: "0.625rem 0.875rem",
              background: "rgba(30,41,59,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px",
              color: "#e2e8f0",
              fontSize: "14px",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.3)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.06)")}
          />
          <input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              padding: "0.625rem 0.875rem",
              background: "rgba(30,41,59,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px",
              color: "#e2e8f0",
              fontSize: "14px",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.3)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.06)")}
          />

          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
            <input
              placeholder="Search friends to add..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem 0.5rem 2rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "10px",
                color: "#e2e8f0",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 1.25rem 0.5rem" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "#475569", fontSize: "13px", padding: "1.5rem" }}>
              No friends found
            </div>
          ) : (
            filtered.map((u) => {
              const sel = selectedIds.includes(u._id);
              const p = pick(u._id);
              return (
                <div
                  key={u._id}
                  onClick={() => toggleMember(u._id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.5rem 0.625rem",
                    borderRadius: "10px",
                    cursor: "pointer",
                    background: sel ? "rgba(139,92,246,0.12)" : "transparent",
                    marginBottom: "2px",
                  }}
                  onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                  onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = "transparent"; }}
                >
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "4px",
                      border: `2px solid ${sel ? "#7c3aed" : "rgba(255,255,255,0.15)"}`,
                      background: sel ? "#7c3aed" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.15s",
                    }}
                  >
                    {sel && <X size={9} color="white" style={{ transform: "rotate(45deg)" }} />}
                  </div>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: "600",
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    {u.avatar ? (
                      <img src={u.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      u.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: "500", color: "#e2e8f0" }}>{u.name}</span>
                </div>
              );
            })
          )}
        </div>

        <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent",
                color: "#64748b",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim() || selectedIds.length === 0}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "10px",
                border: "none",
                background: !name.trim() || selectedIds.length === 0
                  ? "rgba(30,41,59,0.8)"
                  : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                color: !name.trim() || selectedIds.length === 0 ? "#475569" : "white",
                fontSize: "13px",
                fontWeight: "600",
                cursor: !name.trim() || selectedIds.length === 0 ? "not-allowed" : "pointer",
                boxShadow: !name.trim() || selectedIds.length === 0 ? "none" : "0 4px 16px rgba(109,40,217,0.35)",
              }}
            >
              Create Group ({selectedIds.length + 1} members)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
