import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-white shadow-lg transition-all z-50
          ${toast.type === "error" ? "bg-red-500" : toast.type === "success" ? "bg-green-500" : "bg-blue-500"}`}
        >
          {toast.msg}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
