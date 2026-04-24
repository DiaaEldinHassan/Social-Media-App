import React, { useState } from "react";

const Input = ({
  label,
  id,
  type = "text",
  error,
  icon,
  className = "",
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerClasses = [
    "input-container",
    isFocused ? "focused" : "",
    error ? "has-error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const inputClasses = [
    "input-field",
    icon ? "has-icon" : "",
    error ? "has-error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}

      <div className={containerClasses}>
        {icon && <div className="input-icon">{icon}</div>}

        <input
          id={id}
          type={type}
          className={inputClasses}
          onFocus={(e) => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (props.onBlur) props.onBlur(e);
          }}
          {...props}
        />
      </div>

      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default Input;