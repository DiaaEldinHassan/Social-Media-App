import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
  icon,
  disabled = false,
  className = "",
  onClick,
  ...props
}) => {
  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  const classes = [
    "btn",
    `btn-${size}`,
    `btn-${variant}`,
    fullWidth ? "btn-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {icon && <span style={{ marginRight: "0.5rem" }}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;