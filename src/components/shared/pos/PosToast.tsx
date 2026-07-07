import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type PosToastType = "success" | "error" | "warning" | "info";

export interface PosToastItem {
  id: string;
  type: PosToastType;
  message: string;
}

const TOAST_DURATION_MS = 3500;

const toastDot: Record<PosToastType, string> = {
  success: "bg-success-foreground",
  error: "bg-destructive",
  warning: "bg-warning-foreground",
  info: "bg-primary",
};

export function usePosToast() {
  const [toasts, setToasts] = useState<PosToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());
  const recentToastRef = useRef<{ key: string; at: number } | null>(null);

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: PosToastType, message: string) => {
      const key = `${type}:${message}`;
      const now = Date.now();
      if (
        recentToastRef.current?.key === key &&
        now - recentToastRef.current.at < 300
      ) {
        return;
      }
      recentToastRef.current = { key, at: now };

      const id = `${now}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, message }]);

      const timer = window.setTimeout(() => {
        dismiss(id);
      }, TOAST_DURATION_MS);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return { toasts, showToast, dismiss };
}

export function PosToaster({
  toasts,
  onDismiss,
}: {
  toasts: PosToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-4 left-1/2 z-200 flex w-[min(calc(100vw-2rem),20rem)] -translate-x-1/2 flex-col gap-1.5"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="group pointer-events-auto flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2 animate-in fade-in duration-150"
        >
          <span
            aria-hidden
            className={cn("size-1.5 shrink-0 rounded-full", toastDot[toast.type])}
          />

          <p className="min-w-0 flex-1 text-[13px] leading-snug text-foreground">
            {toast.message}
          </p>

          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="shrink-0 rounded-md p-0.5 text-muted-foreground/50 transition-colors hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
