import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, ShieldCheck } from "lucide-react";
import Input from "../../components/common/Input/Input";
import Button from "../../components/common/Button/Button";
import { authService } from "../../services/auth.service";

const OTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromSignUp = location.state?.email ?? "";
  const [formData, setFormData] = useState({
    email: emailFromSignUp,
    otp: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authService.confirmOtp(formData);
      setMessage("OTP verified successfully. Redirecting...");
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Unable to verify OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell animate-fade-in">
      <div className="glass-card" style={{ padding: "2rem", maxWidth: "420px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "700", marginBottom: "0.5rem", background: "linear-gradient(to right, #fff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Verify your account
          </h1>
          <p style={{ color: "#94a3b8" }}>Enter the OTP from your email</p>
        </div>

        <form style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }} onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <Input
            label="Email address"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            icon={<Mail size={18} />}
            required
            disabled={loading}
          />

          <Input
            label="OTP code"
            id="otp"
            type="text"
            placeholder="Enter 6-digit code"
            value={formData.otp}
            onChange={handleChange}
            icon={<ShieldCheck size={18} />}
            required
            disabled={loading}
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "#94a3b8" }}>
          Didn't receive the code?{" "}
          <button
            type="button"
            style={{ color: "#a78bfa", background: "none", border: "none", cursor: "pointer" }}
            onClick={() => alert("Resend functionality not implemented yet")}
          >
            Resend
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTP;