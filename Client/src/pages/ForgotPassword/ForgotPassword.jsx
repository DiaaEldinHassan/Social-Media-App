import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import Input from "../../components/common/Input/Input";
import Button from "../../components/common/Button/Button";
import { authService } from "../../services/auth.service";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await authService.forgotPassword({ email });
      setSuccess("Password reset instructions sent to your email");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell animate-fade-in">
      <div className="glass-card" style={{ padding: "2rem", maxWidth: "420px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "700", marginBottom: "0.5rem", background: "linear-gradient(to right, #fff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Forgot Password
          </h1>
          <p style={{ color: "#94a3b8" }}>Enter your email to receive reset instructions</p>
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}
        {success && <div className="alert alert-success mb-4">{success}</div>}

        <form style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }} onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={20} />}
            required
            disabled={loading}
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Sending..." : "Send Reset Instructions"}
          </Button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <Link to="/login" style={{ display: "inline-flex", alignItems: "center", color: "#a78bfa", fontSize: "0.875rem" }}>
            <ArrowLeft size={16} style={{ marginRight: "0.5rem" }} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;