import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button/Button";
import { authService } from "../../services/auth.service";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleTestApi = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await authService.getUsers();
      console.log(response)
      setMessage("API is working! " + JSON.stringify(response));
    } catch (error) {
      setMessage("Error: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setMessage("Logged out successfully");
  };

  const token = localStorage.getItem("accessToken");

  const cardStyle = {
    padding: "2rem 3rem",
    maxWidth: "720px",
    width: "100%",
    textAlign: "center",
  };

  return (
    <div className="page-shell animate-fade-in">
      <div className="glass-card" style={cardStyle}>
        <span style={{ display: "inline-block", borderRadius: "9999px", padding: "0.375rem 1rem", fontSize: "0.75rem", fontWeight: "600", background: "rgba(139, 92, 246, 0.2)", color: "#c4b5fd", border: "1px solid rgba(139, 92, 246, 0.3)", marginBottom: "1.5rem" }}>
          Modern Auth Experience
        </span>

        <h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "1rem", background: "linear-gradient(to right, #fff, #a78bfa, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Welcome to Social Media App
        </h1>
        <p style={{ color: "#94a3b8", marginBottom: "2.5rem", fontSize: "1.125rem", maxWidth: "32rem", margin: "0 auto 2.5rem" }}>
          Connect with friends, share your moments, and discover content in a smoother, cleaner interface.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <Button onClick={handleTestApi} disabled={loading}>
            {loading ? "Testing..." : "Test API Connection"}
          </Button>
          {token && (
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          )}
        </div>

        {message && (
          <div style={{
            padding: "1rem",
            borderRadius: "0.75rem",
            fontSize: "0.875rem",
            maxWidth: "32rem",
            margin: "0 auto",
            background: message.includes("API") ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
            color: message.includes("API") ? "#4ade80" : "#f87171",
            border: `1px solid ${message.includes("API") ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}`
          }}>
            {message}
          </div>
        )}

        {!token && (
          <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", maxWidth: "500px", margin: "2rem auto 0" }}>
            <Link to="/login">
              <Button fullWidth>Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" fullWidth>Create Account</Button>
            </Link>
            <Link to="/forgot-password">
              <Button variant="outline" fullWidth>Forgot Password</Button>
            </Link>
          </div>
        )}

        {token && (
          <div style={{ marginTop: "2rem" }}>
            <Link to="/profile">
              <Button>View Profile</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;