import React from "react";
import classes from "./BackButton.module.css";

const BackButton = ({ onClick, text = "← Πίσω στο Μενού", className = "" }) => {
  return (
    <button
      className={`${classes.backButton} ${className}`}
      onClick={onClick}
      type="button"
    >
      {text}
    </button>
  );
};

export default BackButton;
