const UserListItem = ({ user, palette, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.6875rem 1.25rem",
        cursor: "pointer",
        transition: "all 0.15s",
        position: "relative",
        background: isSelected ? "rgba(139,92,246,0.1)" : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.02)";
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.background = "transparent";
      }}
    >
      {isSelected && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: "3px",
            height: "28px",
            borderRadius: "0 4px 4px 0",
            background: "#7c3aed",
            boxShadow: "0 0 8px rgba(124,58,237,0.4)",
          }}
        />
      )}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            color: "white",
            fontSize: "14px",
            fontWeight: "600",
            boxShadow: `0 4px 12px ${palette.from}33`,
          }}
        >
          {user.avatar ? (
            <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "-1px",
            right: "-1px",
            width: "13px",
            height: "13px",
            borderRadius: "50%",
            border: "2.5px solid #0b0e1a",
            background: "#10b981",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: isSelected ? "#a78bfa" : "#e2e8f0" }}>
            {user.name}
          </span>
          <span style={{ fontSize: "10px", fontWeight: "500", color: "#475569" }}>12:30</span>
        </div>
        <span
          style={{
            fontSize: "13px",
            color: "#64748b",
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginTop: "1px",
          }}
        >
          {user.email}
        </span>
      </div>
    </div>
  );
};

export default UserListItem;
