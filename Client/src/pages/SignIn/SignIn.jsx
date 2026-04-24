import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import Input from "../../components/common/Input/Input";
import Button from "../../components/common/Button/Button";
import SocialLogin from "../../components/auth/SocialLogin";
import { authService } from "../../services/auth.service";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.signIn(formData);
      if (response.accessToken && response.refreshToken) {
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Sign in failed");
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
            Welcome Back
          </h1>
          <p style={{ color: "#94a3b8" }}>Sign in to your account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

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
            label="Password"
            id="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            icon={<Lock size={20} />}
            required
            disabled={loading}
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div style={{ margin: "1.5rem 0", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>
          Or continue with
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <SocialLogin onSuccess={() => navigate("/")} />
        </div>

        <div style={{ textAlign: "center", fontSize: "0.875rem", color: "#94a3b8" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#a78bfa" }}>Sign up</Link>
        </div>

        <div style={{ textAlign: "center", fontSize: "0.875rem", color: "#94a3b8", marginTop: "0.75rem" }}>
          <Link to="/forgot-password" style={{ color: "#a78bfa" }}>Forgot your password?</Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
