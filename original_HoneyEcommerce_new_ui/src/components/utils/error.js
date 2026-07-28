import React from "react";

const ErrorMessage = ({ message, show = true }) => {
  if (!show) return null;
  return (
    <div className="invalid-feedback invalid-feedback-remove-display-none-property">
      {message}
    </div>
  );
};

export default ErrorMessage;
