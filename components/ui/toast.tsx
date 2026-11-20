"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  title?: string;
  description: string;
  type?: ToastType;
}

interface ToastContextType {
  toast: (opts: { title?: string; description: string; type?: ToastType }) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback(
    ({ title, description, type = "info" }: { title?: string; description: string; type?: ToastType }) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, title, description, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
            error: <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />,
            info: <Info className="h-5 w-5 text-blue-600 shrink-0" />,
          };

          const borderColors = {
            success: "border-emerald-200 dark:border-emerald-900 bg-emerald-50/90 dark:bg-emerald-950/80",
            error: "border-red-200 dark:border-red-900 bg-red-50/90 dark:bg-red-950/80",
            info: "border-blue-200 dark:border-blue-900 bg-blue-50/90 dark:bg-blue-950/80",
          };

          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-bottom-2",
                borderColors[t.type || "info"]
              )}
            >
              {icons[t.type || "info"]}
              <div className="flex-1 text-sm">
                {t.title && <div className="font-bold text-slate-900 dark:text-slate-100">{t.title}</div>}
                <div className="text-slate-700 dark:text-slate-300 leading-snug">{t.description}</div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label="Dismiss toast"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
