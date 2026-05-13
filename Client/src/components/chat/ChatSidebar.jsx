import { useState } from "react";
import { Search, MessageSquare, UserPlus, User, X, Users, Plus } from "lucide-react";
import UserListItem from "./UserListItem";
import CreateGroupModal from "./CreateGroupModal";

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

const ChatSidebar = ({
  friends,
  selectedUser,
  selectedGroup,
  search,
  onSearchChange,
  onSelectUser,
  onSelectGroup,
  onGroupCreated,
  loading,
  error,
  onNavigate,
  onClose,
  groups,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tab, setTab] = useState("direct");

  const chatUsers = friends.map((f) => ({
    _id: f.friendId?._id,
    name: f.friendId?.username || "Unknown",
    email: f.friendId?.email,
    avatar: f.friendId?.profilePicture,
  }));

  const filteredUsers = chatUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredGroups = (groups || []).filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreateGroup = async (name, description, memberIds) => {
    await onGroupCreated(name, description, memberIds);
    setShowCreateModal(false);
  };

  return (
    <div
      className="w-full md:w-80 md:min-w-[280px] lg:min-w-[320px] flex flex-col"
      style={{ background: "#0b0e1a", borderRight: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="px-5 pt-4 pb-3 md:pt-5 md:pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(109,40,217,0.3)",
              }}
            >
              <MessageSquare size={15} color="white" />
            </div>
            <span className="font-bold tracking-tight" style={{ fontSize: "15px", color: "#f1f5f9" }}>Chats</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
              style={{ background: "rgba(139,92,246,0.15)", border: "none", color: "#a78bfa", cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.25)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.15)"; }}
              title="Create Group"
            >
              <Plus size={14} />
            </button>
            <button onClick={onClose} className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
              <X size={16} style={{ color: "#64748b" }} />
            </button>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#475569",
              zIndex: 1,
            }}
          />
          <input
            placeholder="Search or start a new chat"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-sm rounded-xl outline-none transition-all duration-200"
            style={{
              padding: "0.5rem 0.75rem 0.5rem 2.25rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#e2e8f0",
            }}
            onFocus={(e) => {
              e.target.style.background = "rgba(255,255,255,0.06)";
              e.target.style.borderColor = "rgba(139,92,246,0.3)";
            }}
            onBlur={(e) => {
              e.target.style.background = "rgba(255,255,255,0.04)";
              e.target.style.borderColor = "rgba(255,255,255,0.06)";
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-5 pt-2 pb-1 gap-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
        <button
          onClick={() => setTab("direct")}
          style={{
            flex: 1,
            padding: "0.375rem 0",
            borderRadius: "8px",
            border: "none",
            background: tab === "direct" ? "rgba(139,92,246,0.15)" : "transparent",
            color: tab === "direct" ? "#a78bfa" : "#64748b",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Direct
        </button>
        <button
          onClick={() => setTab("groups")}
          style={{
            flex: 1,
            padding: "0.375rem 0",
            borderRadius: "8px",
            border: "none",
            background: tab === "groups" ? "rgba(139,92,246,0.15)" : "transparent",
            color: tab === "groups" ? "#a78bfa" : "#64748b",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Groups
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "direct" ? (
          loading ? (
            <div className="py-16 text-center" style={{ color: "#475569", fontSize: "13px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  margin: "0 auto 0.75rem",
                  border: "2px solid rgba(139,92,246,0.2)",
                  borderTopColor: "#7c3aed",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Loading chats...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm" style={{ color: "#f87171" }}>{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 px-8 text-center">
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 0.75rem",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MessageSquare size={20} color="#334155" />
              </div>
              <p style={{ color: "#475569", fontSize: "13px", lineHeight: "1.5" }}>
                {search ? "No conversations match your search" : "No conversations yet"}
              </p>
            </div>
          ) : (
            <div>
              {filteredUsers.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  palette={pick(user._id)}
                  isSelected={selectedUser?._id === user._id && !selectedGroup}
                  onSelect={() => onSelectUser(user)}
                />
              ))}
            </div>
          )
        ) : (
          // Groups tab
          !groups || groups.length === 0 ? (
            <div className="py-16 px-8 text-center">
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 0.75rem",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Users size={20} color="#334155" />
              </div>
              <p style={{ color: "#475569", fontSize: "13px", lineHeight: "1.5" }}>
                {search ? "No groups match your search" : "No groups yet"}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  marginTop: "0.75rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "10px",
                  border: "none",
                  background: "rgba(139,92,246,0.15)",
                  color: "#a78bfa",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Create your first group
              </button>
            </div>
          ) : (
            <div>
              {filteredGroups.map((g) => {
                const p = pick(g._id);
                const isSel = selectedGroup?._id === g._id;
                return (
                  <div
                    key={g._id}
                    onClick={() => onSelectGroup(g)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.6875rem 1.25rem",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      position: "relative",
                      background: isSel ? "rgba(139,92,246,0.1)" : "transparent",
                    }}
                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                    onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
                  >
                    {isSel && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "3px",
                          height: "28px",
                          borderRadius: "0 4px 4px 0",
                          background: "#7c3aed",
                          boxShadow: "0 0 8px rgba(124,58,237,0.4)",
                        }}
                      />
                    )}
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "600",
                        flexShrink: 0,
                      }}
                    >
                      {g.avatar ? (
                        <img src={g.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                      ) : (
                        g.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: isSel ? "#a78bfa" : "#e2e8f0" }}>
                          {g.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginTop: "1px",
                        }}
                      >
                        {g.members?.length || 0} members
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      <div className="p-2.5 px-3 flex gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <button
          onClick={() => onNavigate("/friends")}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150"
          style={{ color: "#64748b", background: "transparent", border: "none", cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#cbd5e1"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}
        >
          <UserPlus size={14} />
          Friends
        </button>
        <button
          onClick={() => onNavigate("/profile")}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150"
          style={{ color: "#64748b", background: "transparent", border: "none", cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#cbd5e1"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}
        >
          <User size={14} />
          Profile
        </button>
      </div>

      {showCreateModal && (
        <CreateGroupModal
          friends={friends}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateGroup}
        />
      )}
    </div>
  );
};

export default ChatSidebar;
