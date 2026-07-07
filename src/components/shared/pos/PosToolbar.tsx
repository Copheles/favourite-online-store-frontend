import { cn } from "@/lib/utils";

export function PosToolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-card sm:p-5 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PosToolbarGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {children}
    </div>
  );
}

export function PosToolbarActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex shrink-0 flex-wrap gap-2", className)}>
      {children}
    </div>
  );
}
