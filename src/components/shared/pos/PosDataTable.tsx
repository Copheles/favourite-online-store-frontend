import { cn } from "@/lib/utils";

export function PosDataTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/70 bg-card shadow-card",
        className,
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function PosTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <table className={cn("min-w-full text-sm", className)}>{children}</table>
  );
}

export function PosTableHead({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <thead className="bg-muted/60 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      {children}
    </thead>
  );
}

export function PosTableBody({
  children,
}: {
  children: React.ReactNode;
}) {
  return <tbody>{children}</tbody>;
}

export function PosTableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={cn(
        "border-t border-border/70 transition-colors hover:bg-primary/[0.03] dark:hover:bg-primary/[0.06]",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function PosTableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-4 py-3 first:pl-5 last:pr-5", className)}>
      {children}
    </td>
  );
}

export function PosTableHeaderCell({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("px-4 py-3.5 font-semibold first:pl-5 last:pr-5", className)}>
      {children}
    </th>
  );
}
