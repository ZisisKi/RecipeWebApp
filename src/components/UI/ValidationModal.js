import React, { useEffect } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import classes from "./ValidationModal.module.css";

const ValidationModal = ({ open, type = "error", message, onClose }) => {
  

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;


  let Icon = Info;
  let title = "Ενημέρωση";
  let iconClass = classes.iconInfo;

  if (type === "error") {
    Icon = AlertCircle;
    title = "Προσοχή!";
    iconClass = classes.iconError;
  } else if (type === "success") {
    Icon = CheckCircle2;
    title = "Επιτυχία!";
    iconClass = classes.iconSuccess;
  }


  const handleBackdropClick = () => onClose();
  const handleModalClick = (e) => e.stopPropagation();

  return (
    <div className={classes.backdrop} onClick={handleBackdropClick}>
      <div className={classes.modal} onClick={handleModalClick}>
        
        <div className={classes.header}>
          <Icon size={48} className={iconClass} />
          <h3 className={classes.title}>{title}</h3>
        </div>
        
        <p className={classes.message}>{message}</p>
        
        <button className={classes.btn} onClick={onClose} type="button">
          Εντάξει
        </button>
      </div>
    </div>
  );
};

export default ValidationModal;