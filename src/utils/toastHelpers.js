import { useToast } from "../components/ToastProvider.jsx"; // 👈 betul

export function useToastHelpers() {
  const { show } = useToast();

  return {
    toastSuccess: (msg, timeout = 2000) => show(msg, { type: "success", timeout }),
    toastError: (msg, timeout = 2000) => show(msg, { type: "error", timeout }),
    toastWarning: (msg, timeout = 2000) => show(msg, { type: "warning", timeout }),
    toastInfo: (msg, timeout = 2000) => show(msg, { type: "info", timeout }),
  };
}
