import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, MessageSquare, Newspaper, User, Users, LogOut } from "lucide-react";
import { authService } from "../../../services/auth.service";

const links = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/feed", icon: Newspaper, label: "Feed" },
  { to: "/chat", icon: MessageSquare, label: "Chat" },
  { to: "/friends", icon: Users, label: "Friends" },
  { to: "/profile", icon: User, label: "Profile" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  if (!token) return null;

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    navigate("/login");
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
          height: "60px",
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: "1.15rem",
            fontWeight: "700",
            background: "linear-gradient(to right, #fff, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textDecoration: "none",
          }}
        >
          Social App
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem 0.875rem",
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? "600" : "500",
                  color: isActive ? "#c4b5fd" : "#94a3b8",
                  background: isActive ? "rgba(139, 92, 246, 0.12)" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
              >
                <link.icon size={18} />
                <span className="hidden sm:inline">
                  {link.label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.5rem 0.875rem",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#94a3b8",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
