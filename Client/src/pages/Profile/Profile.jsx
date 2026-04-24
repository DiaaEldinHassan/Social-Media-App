import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Camera, Save, LogOut, Key } from "lucide-react";
import Input from "../../components/common/Input/Input";
import Button from "../../components/common/Button/Button";
import { userService } from "../../services/user.service";
import { authService } from "../../services/auth.service";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userData = await userService.getProfile();
      setUser(userData);
      setFormData({
        username: userData.username || "",
        email: userData.email || "",
      });
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const updatedUser = await userService.updateProfile(formData);
      setUser(updatedUser);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await authService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const url = await userService.uploadProfilePic(file);
      const updatedUser = { ...user, profilePicture: url };
      setUser(updatedUser);
      setSuccess("Profile picture updated successfully");
    } catch (err) {
      setError("Failed to upload profile picture");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
    } catch (err) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    }
  };

  if (profileLoading) {
    return (
      <div className="page-shell">
        <div style={{ color: "#94a3b8" }}>Loading profile...</div>
      </div>
    );
  }

  const cardStyle = {
    padding: "2rem",
    maxWidth: "540px",
    width: "100%",
  };

  return (
    <div className="page-shell animate-fade-in">
      <div className="glass-card" style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "700", marginBottom: "0.5rem", background: "linear-gradient(to right, #fff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Profile Settings
          </h1>
          <p style={{ color: "#94a3b8" }}>Manage your account</p>
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}
        {success && <div className="alert alert-success mb-4">{success}</div>}

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: "6rem", height: "6rem", borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "2px solid rgba(255,255,255,0.1)" }}>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <User size={32} style={{ color: "#64748b" }} />
              )}
            </div>
            <label style={{ position: "absolute", bottom: 0, right: 0, background: "#8b5cf6", borderRadius: "50%", padding: "0.5rem", cursor: "pointer" }}>
              <Camera size={16} style={{ color: "#f1f5f9" }} />
              <input type="file" accept="image/*" onChange={handleProfilePicUpload} style={{ display: "none" }} disabled={loading} />
            </label>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "0.5rem" }}>Click to change profile picture</p>
        </div>

        <form onSubmit={handleProfileUpdate} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2rem" }}>
          <Input
            label="Full Name"
            id="username"
            type="text"
            placeholder="John Doe"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            icon={<User size={20} />}
            disabled={loading}
          />

          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            icon={<Mail size={20} />}
            disabled={loading}
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
            <Save size={18} />
          </Button>
        </form>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#e2e8f0" }}>Change Password</h2>
            <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(!showPasswordForm)}>
              <Key size={16} />
              {showPasswordForm ? "Cancel" : "Change"}
            </Button>
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordUpdate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Input
                label="Current Password"
                id="currentPassword"
                type="password"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
                disabled={loading}
              />

              <Input
                label="New Password"
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                disabled={loading}
              />

              <Input
                label="Confirm New Password"
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                disabled={loading}
              />

              <Button type="submit" fullWidth disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "2rem", marginTop: "2rem" }}>
          <Button variant="danger" fullWidth onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;