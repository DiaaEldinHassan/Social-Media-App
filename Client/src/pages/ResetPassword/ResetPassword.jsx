import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import Input from "../../components/common/Input/Input";
import Button from "../../components/common/Button/Button";
import { authService } from "../../services/auth.service";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: searchParams.get("email") || "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await authService.resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });
      setSuccess("Password reset successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="page-shell animate-fade-in">
      <div className="glass-card" style={{ padding: "2rem", maxWidth: "420px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "700", marginBottom: "0.5rem", background: "linear-gradient(to right, #fff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Reset Password
          </h1>
          <p style={{ color: "#94a3b8" }}>Enter the OTP and your new password</p>
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}
        {success && <div className="alert alert-success mb-4">{success}</div>}

        <form style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }} onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            icon={<Mail size={20} />}
            required
            disabled={loading}
          />

          <Input
            label="OTP Code"
            id="otp"
            type="text"
            placeholder="Enter 6-digit code"
            value={formData.otp}
            onChange={handleChange}
            icon={<ShieldCheck size={20} />}
            required
            disabled={loading}
          />

          <Input
            label="New Password"
            id="newPassword"
            type="password"
            placeholder="Create new password"
            value={formData.newPassword}
            onChange={handleChange}
            icon={<Lock size={20} />}
            required
            disabled={loading}
          />

          <Input
            label="Confirm New Password"
            id="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            icon={<Lock size={20} />}
            required
            disabled={loading}
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;