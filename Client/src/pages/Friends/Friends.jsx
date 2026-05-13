import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  UserPlus,
  UserCheck,
  UserX,
  Users,
  Clock,
  ArrowLeft,
  User,
  Check,
  Inbox,
} from "lucide-react";
import Button from "../../components/common/Button/Button";
import { userService } from "../../services/user.service";

const Friends = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchStr, setSearchStr] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (token) {
      loadFriends();
      loadPendingRequests();
    }
  }, []);

  const loadFriends = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await userService.getFriends();
      setFriends(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const data = await userService.getPendingRequests();
      setPendingRequests(data);
    } catch (err) {
      // silent
    }
  };

  const handleSearch = async () => {
    if (!searchStr.trim()) return;
    setSearching(true);
    setError("");
    try {
      const results = await userService.searchUsers(searchStr);
      setSearchResults(results || []);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (friendId) => {
    try {
      await userService.sendFriendRequest(friendId);
      setSearchResults((prev) =>
        prev.map((u) =>
          u._id === friendId ? { ...u, requestSent: true } : u
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send request");
    }
  };

  const handleAcceptRequest = async (friendId) => {
    try {
      await userService.acceptFriendRequest(friendId);
      setPendingRequests((prev) => prev.filter((r) => r.friendId?._id !== friendId));
      loadFriends();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept request");
    }
  };

  const friendIds = new Set(friends.map((f) => f.friendId?._id));

  if (!token) {
    return (
      <div className="page-shell animate-fade-in">
        <div className="glass-card" style={{ padding: "3rem", maxWidth: "400px", width: "100%", textAlign: "center" }}>
          <Users size={48} style={{ color: "#64748b", marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>Sign in Required</h2>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>Sign in to manage friends.</p>
          <Button onClick={() => navigate("/login")}>Go to Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: "720px", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "0.25rem" }}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "700", background: "linear-gradient(to right, #fff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Friends
        </h1>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setTab("friends")}
          style={{
            flex: 1,
            padding: "0.75rem",
            borderRadius: "0.75rem",
            border: "none",
            background: tab === "friends" ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.06)",
            color: tab === "friends" ? "#c4b5fd" : "#94a3b8",
            fontWeight: tab === "friends" ? "600" : "400",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <Users size={16} style={{ marginRight: "0.375rem", verticalAlign: "middle" }} />
          Friends ({friends.length})
        </button>
        <button
          onClick={() => setTab("pending")}
          style={{
            flex: 1,
            padding: "0.75rem",
            borderRadius: "0.75rem",
            border: "none",
            background: tab === "pending" ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.06)",
            color: tab === "pending" ? "#c4b5fd" : "#94a3b8",
            fontWeight: tab === "pending" ? "600" : "400",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <Clock size={16} style={{ marginRight: "0.375rem", verticalAlign: "middle" }} />
          Pending ({pendingRequests.length})
        </button>
        <button
          onClick={() => setTab("search")}
          style={{
            flex: 1,
            padding: "0.75rem",
            borderRadius: "0.75rem",
            border: "none",
            background: tab === "search" ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.06)",
            color: tab === "search" ? "#c4b5fd" : "#94a3b8",
            fontWeight: tab === "search" ? "600" : "400",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <Search size={16} style={{ marginRight: "0.375rem", verticalAlign: "middle" }} />
          Find People
        </button>
      </div>

      {/* Friends Tab */}
      {tab === "friends" && (
        <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Loading...</div>
          ) : friends.length === 0 ? (
            <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
              <Users size={48} style={{ color: "#64748b", marginBottom: "1rem" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#94a3b8", marginBottom: "0.5rem" }}>
                No friends yet
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                Search for people to connect with
              </p>
              <Button onClick={() => setTab("search")}>Find People</Button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {friends.map((friend) => {
                const info = friend.friendId || {};
                return (
                  <div key={info._id} className="glass-card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {info.profilePicture ? (
                        <img src={info.profilePicture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <User size={22} style={{ color: "#64748b" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#f1f5f9" }}>
                        {info.username || "Unknown"}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <UserCheck size={12} />
                        Friends
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pending Tab */}
      {tab === "pending" && (
        <div>
          {pendingRequests.length === 0 ? (
            <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
              <Inbox size={48} style={{ color: "#64748b", marginBottom: "1rem" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#94a3b8", marginBottom: "0.5rem" }}>
                No pending requests
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                Friend requests from other users will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {pendingRequests.map((req) => {
                const info = req.friendId || {};
                return (
                  <div key={info._id} className="glass-card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {info.profilePicture ? (
                        <img src={info.profilePicture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <User size={22} style={{ color: "#64748b" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#f1f5f9" }}>
                        {info.username || "Unknown"}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Clock size={12} />
                        Wants to connect
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleAcceptRequest(info._id)}>
                      <Check size={16} />
                      Accept
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Search Tab */}
      {tab === "search" && (
        <div>
          <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={18} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#64748b", zIndex: 1 }} />
                <input
                  placeholder="Search by name or email..."
                  value={searchStr}
                  onChange={(e) => setSearchStr(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem 0.75rem 2.5rem",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "0.75rem",
                    color: "#f1f5f9",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>
              <Button onClick={handleSearch} disabled={searching || !searchStr.trim()}>
                {searching ? "..." : "Search"}
              </Button>
            </div>
          </div>

          {searching && (
            <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Searching...</div>
          )}

          {!searching && searchResults.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {searchResults.map((user) => {
                const isFriend = friendIds.has(user._id);
                const requestSent = user.requestSent;
                return (
                  <div key={user._id} className="glass-card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <User size={22} style={{ color: "#64748b" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#f1f5f9" }}>
                        {user.username || "Unknown"}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {user.email}
                      </div>
                    </div>
                    {isFriend ? (
                      <span style={{ fontSize: "0.8rem", color: "#22c55e", display: "flex", alignItems: "center", gap: "0.25rem", whiteSpace: "nowrap" }}>
                        <UserCheck size={16} />
                        Friends
                      </span>
                    ) : requestSent ? (
                      <span style={{ fontSize: "0.8rem", color: "#f59e0b", display: "flex", alignItems: "center", gap: "0.25rem", whiteSpace: "nowrap" }}>
                        <Clock size={16} />
                        Pending
                      </span>
                    ) : (
                      <Button size="sm" onClick={() => handleSendRequest(user._id)}>
                        <UserPlus size={16} />
                        Add
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!searching && searchStr && searchResults.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
              No users found matching "{searchStr}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Friends;
