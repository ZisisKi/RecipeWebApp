import React, { useEffect } from "react";
import classes from "./ConfirmModal.module.css";

const ConfirmModal = ({
  open,
  title,
  message,
  confirmText = "Επιβεβαίωση",
  cancelText = "Ακύρωση",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className={classes.backdrop} onMouseDown={onCancel}>
      <div className={classes.modal} onMouseDown={(e) => e.stopPropagation()}>
        <h3 className={classes.title}>{title}</h3>
        <p className={classes.message}>{message}</p>

        <div className={classes.actions}>
          <button className={classes.cancelBtn} onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>

          <button className={classes.confirmBtn} onClick={onConfirm} disabled={loading}>
            {loading ? "Παρακαλώ περιμένετε..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
