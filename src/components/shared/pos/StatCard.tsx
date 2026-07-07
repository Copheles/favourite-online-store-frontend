import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/70 bg-card p-4 shadow-card transition-shadow hover:shadow-card-hover sm:p-5">
      {accent && (
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.5 bg-[linear-gradient(90deg,#2563eb,#3b82f6)]"
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            accent
              ? "bg-primary/10 text-primary"
              : "bg-accent text-accent-foreground",
          )}
        >
          <Icon className="size-4" strokeWidth={2} />
        </span>
      </div>
      <p
        className={cn(
          "mt-2 text-xl font-bold tracking-tight sm:text-2xl",
          accent ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
