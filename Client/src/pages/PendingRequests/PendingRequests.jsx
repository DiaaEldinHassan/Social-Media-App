import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, UserPlus, Clock, Check, X } from "lucide-react";
import Button from "../../components/common/Button/Button";
import { userService } from "../../services/user.service";

const PendingRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (token) loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await userService.getPendingRequests();
      setRequests(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (friendId) => {
    try {
      await userService.acceptFriendRequest(friendId);
      setRequests((prev) => prev.filter((r) => r.friendId?._id !== friendId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept");
    }
  };

  if (!token) {
    return (
      <div className="page-shell animate-fade-in">
        <div className="glass-card" style={{ padding: "3rem", maxWidth: "400px", width: "100%", textAlign: "center" }}>
          <User size={48} style={{ color: "#64748b", marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>Sign in Required</h2>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>Sign in to see pending requests.</p>
          <Button onClick={() => navigate("/login")}>Go to Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: "600px", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <button onClick={() => navigate("/friends")} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "0.25rem" }}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "700", background: "linear-gradient(to right, #fff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Pending Requests
        </h1>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Loading...</div>
      ) : requests.length === 0 ? (
        <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
          <Clock size={48} style={{ color: "#64748b", marginBottom: "1rem" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#94a3b8", marginBottom: "0.5rem" }}>
            No pending requests
          </h3>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            When someone sends you a friend request, it will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {requests.map((req) => {
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
                    Want to connect
                  </div>
                </div>
                <Button size="sm" onClick={() => handleAccept(info._id)}>
                  <Check size={16} />
                  Accept
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingRequests;
