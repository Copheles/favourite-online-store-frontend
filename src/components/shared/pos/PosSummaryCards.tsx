import { cn } from "@/lib/utils";

export function PosSummaryCards({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PosSummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
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
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-xl font-bold tracking-tight sm:text-2xl",
          accent ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}
