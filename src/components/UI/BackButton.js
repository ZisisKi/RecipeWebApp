import React from "react";
import { ArrowLeft } from "lucide-react";
import classes from "./BackButton.module.css";

const BackButton = ({ onClick, text = "Πίσω", className = "" }) => {
  return (
    <button
      className={`${classes.backButton} ${className}`}
      onClick={onClick}
      type="button"
    >
      {/* Το εικονίδιο είναι πλέον μέρος του κουμπιού */}
      <ArrowLeft size={20} className={classes.icon} />
      <span className={classes.text}>{text}</span>
    </button>
  );
};

export default BackButton;