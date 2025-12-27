import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import styles from "./toast.module.css";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timersRef.current.get(id);
    if (t) clearTimeout(t);
    timersRef.current.delete(id);
  }, []);

  const showToast = useCallback(
    ({ title, message, type = "info", duration = 3000 }) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((prev) => [...prev, { id, title, message, type }]);

      const timer = setTimeout(() => removeToast(id), duration);
      timersRef.current.set(id, timer);

      return id;
    },
    [removeToast]
  );

  const value = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className={styles.stack}>
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
            <div className={styles.text}>
              {t.title && <div className={styles.title}>{t.title}</div>}
              <div className={styles.message}>{t.message}</div>
            </div>
            <button className={styles.close} onClick={() => removeToast(t.id)} aria-label="Close">
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>.");
  return ctx.showToast;
};
