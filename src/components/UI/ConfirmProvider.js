import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import ConfirmModal from "./ConfirmModal";

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const resolverRef = useRef(null);

  const [state, setState] = useState({
    open: false,
    title: "Επιβεβαίωση",
    message: "",
    confirmText: "OK",
    cancelText: "Ακύρωση",
  });

  const confirm = useCallback((options) => {
    const {
      title = "Επιβεβαίωση",
      message = "",
      confirmText = "OK",
      cancelText = "Ακύρωση",
    } = options || {};

    setState({
      open: true,
      title,
      message,
      confirmText,
      cancelText,
    });

    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleCancel = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
    resolverRef.current?.(false);
    resolverRef.current = null;
  }, []);

  const handleConfirm = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
    resolverRef.current?.(true);
    resolverRef.current = null;
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      <ConfirmModal
        open={state.open}
        title={state.title}
        message={state.message}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used inside <ConfirmProvider>.");
  }
  return ctx.confirm;
};
