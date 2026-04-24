import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import Input from "../../components/common/Input/Input";
import Button from "../../components/common/Button/Button";
import SocialLogin from "../../components/auth/SocialLogin";
import { authService } from "../../services/auth.service";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await authService.signUp(formData);
      setSuccess("Account created. Check your email for a verification code.");
      setTimeout(
        () =>
          navigate("/otp", {
            state: { email: formData.email },
            replace: true,
          }),
        900,
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Sign up failed");
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
            Create Account
          </h1>
          <p style={{ color: "#94a3b8" }}>Join us today to get started</p>
        </div>

        <form style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }} onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <Input
            label="Full Name"
            id="username"
            type="text"
            placeholder="John Doe"
            value={formData.username}
            onChange={handleChange}
            icon={<User size={20} />}
            required
            disabled={loading}
          />

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
            label="Password"
            id="password"
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            icon={<Lock size={20} />}
            required
            disabled={loading}
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div style={{ margin: "1.5rem 0", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>
          Or sign up with
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <SocialLogin onSuccess={() => navigate("/")} />
        </div>

        <div style={{ textAlign: "center", fontSize: "0.875rem", color: "#94a3b8" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#a78bfa" }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;