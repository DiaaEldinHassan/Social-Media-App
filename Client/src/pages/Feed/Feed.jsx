import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Clock,
  User,
  Newspaper,
} from "lucide-react";
import Button from "../../components/common/Button/Button";
import { postService } from "../../services/post.service";

const Feed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const token = localStorage.getItem("accessToken");

  const loadFeed = async (p = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await postService.getFeed(p, 10);
      const data = res.data || [];
      if (p === 1) {
        setPosts(data);
      } else {
        setPosts((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === 10);
      setPage(p);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    setCreating(true);
    try {
      const res = await postService.createPost(newPost);
      const created = res.data;
      setPosts((prev) => [created, ...prev]);
      setNewPost({ title: "", content: "" });
      setShowCreate(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setCreating(false);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!token) {
    return (
      <div className="page-shell animate-fade-in">
        <div
          className="glass-card"
          style={{
            padding: "3rem",
            maxWidth: "400px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <Newspaper size={48} style={{ color: "#64748b", marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>
            Sign in Required
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
            Sign in to see the feed.
          </p>
          <Button onClick={() => navigate("/login")}>Go to Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "2rem 1rem",
      }}
    >
      {/* Create Post */}
      <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        {showCreate ? (
          <form onSubmit={handleCreate}>
            <input
              placeholder="Post title..."
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.75rem",
                color: "#f1f5f9",
                fontSize: "1rem",
                fontWeight: "600",
                outline: "none",
                marginBottom: "0.75rem",
              }}
              autoFocus
            />
            <textarea
              placeholder="What's on your mind?"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={3}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.75rem",
                color: "#f1f5f9",
                fontSize: "0.9rem",
                outline: "none",
                resize: "none",
                marginBottom: "0.75rem",
                fontFamily: "inherit",
              }}
            />
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCreate(false);
                  setNewPost({ title: "", content: "" });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={creating}>
                {creating ? "Posting..." : "Post"}
              </Button>
            </div>
          </form>
        ) : (
          <div
            onClick={() => setShowCreate(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <User size={20} />
            </div>
            <span style={{ fontSize: "0.95rem" }}>What's on your mind?</span>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {/* Posts List */}
      {posts.map((post) => (
        <div
          key={post._id}
          className="glass-card"
          style={{
            padding: "1.5rem",
            marginBottom: "1rem",
          }}
        >
          {/* Post Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {post.createdBy?.profilePicture ? (
                  <img
                    src={post.createdBy.profilePicture}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <User size={20} style={{ color: "#64748b" }} />
                )}
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#f1f5f9" }}>
                  {post.createdBy?.username || "Unknown"}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    fontSize: "0.75rem",
                    color: "#64748b",
                  }}
                >
                  <Clock size={12} />
                  {formatTime(post.createdAt)}
                </div>
              </div>
            </div>
            <MoreHorizontal
              size={20}
              style={{ color: "#64748b", cursor: "pointer" }}
            />
          </div>

          {/* Post Content */}
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "700",
              color: "#f1f5f9",
              marginBottom: "0.5rem",
            }}
          >
            {post.title}
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#cbd5e1", lineHeight: "1.6", marginBottom: "1rem" }}>
            {post.content}
          </p>

          {/* Post Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              paddingTop: "0.75rem",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                background: "none",
                border: "none",
                color: "#94a3b8",
                fontSize: "0.85rem",
                cursor: "pointer",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.5rem",
              }}
            >
              <Heart size={18} />
              {post.reactionsCount || post.reactions?.length || 0}
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                background: "none",
                border: "none",
                color: "#94a3b8",
                fontSize: "0.85rem",
                cursor: "pointer",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.5rem",
              }}
            >
              <MessageCircle size={18} />
              {post.commentsCount || 0}
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                background: "none",
                border: "none",
                color: "#94a3b8",
                fontSize: "0.85rem",
                cursor: "pointer",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.5rem",
                marginLeft: "auto",
              }}
            >
              <Send size={16} />
              Share
            </button>
          </div>
        </div>
      ))}

      {/* Load More / Loading State */}
      {loading && (
        <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
          Loading...
        </div>
      )}
      {!loading && hasMore && (
        <div style={{ textAlign: "center", padding: "1rem 0 2rem" }}>
          <Button variant="outline" onClick={() => loadFeed(page + 1)}>
            Load More
          </Button>
        </div>
      )}
      {!loading && posts.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "#64748b",
          }}
        >
          <p>No posts yet. Be the first to share something!</p>
        </div>
      )}
    </div>
  );
};

export default Feed;
