import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { clsx } from "clsx";

const ToastContext = createContext(null);
let sequence = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message, variant = "default") => {
      const id = ++sequence;
      setToasts((prev) => [...prev, { id, message, variant }]);
      window.setTimeout(() => removeToast(id), 2500);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-200 flex flex-col gap-2.5">
        {toasts.map((item) => (
          <ToastItem key={item.id} {...item} onClose={() => removeToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ message, variant }) {
  const icon =
    variant === "success" ? (
      <CheckCircle2 size={16} className="text-success" />
    ) : variant === "error" ? (
      <XCircle size={16} className="text-danger" />
    ) : (
      <Info size={16} className="text-primary-hover" />
    );

  return (
    <div
      className={clsx(
        "bg-card border border-edge-glow px-4.5 py-3 rounded-[10px] text-sm font-medium shadow-card animate-toast-in flex items-center gap-2.5",
        variant === "success" && "border-success/30",
        variant === "error" && "border-danger/30"
      )}
    >
      {icon}
      <span className="text-ink">{message}</span>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus dipakai di dalam ToastProvider");
  }
  return context;
}
