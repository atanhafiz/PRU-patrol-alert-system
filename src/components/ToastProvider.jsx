// src/components/Toast.jsx
import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const remove = useCallback((id) => {
    setItems((xs) => xs.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((msg, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    const toast = {
      id,
      msg,
      type: opts.type || "success", // success | info | warning | error
      timeout: typeof opts.timeout === "number" ? opts.timeout : 2000,
    };
    setItems((xs) => [...xs, toast]);
    setTimeout(() => remove(id), toast.timeout);
    return id;
  }, [remove]);

  const api = useMemo(() => ({ show, remove }), [show, remove]);

  return (
    <ToastCtx.Provider value={api}>
      {children}

      {/* Container */}
      <div className="fixed bottom-3 right-3 z-[9999] space-y-2 pointer-events-none">
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto min-w-[220px] max-w-[90vw] sm:max-w-sm px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium anim-pop
              ${t.type === "success" ? "bg-emerald-600 text-white" : ""}
              ${t.type === "info" ? "bg-slate-800 text-white" : ""}
              ${t.type === "warning" ? "bg-amber-600 text-white" : ""}
              ${t.type === "error" ? "bg-red-600 text-white" : ""}
            `}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast() must be used within <ToastProvider>");
  return ctx;
}
