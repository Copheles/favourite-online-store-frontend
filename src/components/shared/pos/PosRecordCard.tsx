import { cn } from "@/lib/utils";

export function PosRecordCardList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3 md:hidden", className)}>{children}</div>
  );
}

export interface PosRecordCardField {
  label: string;
  value: React.ReactNode;
}

export function PosRecordCard({
  title,
  subtitle,
  leading,
  trailing,
  fields,
  actions,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  fields: PosRecordCardField[];
  actions?: React.ReactNode;
  className?: string;
}) {
  const visibleFields = fields.filter((field) => field.value != null);

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card p-4 shadow-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {leading != null && <div className="shrink-0">{leading}</div>}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {title}
            </p>
            {subtitle != null && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {trailing != null && (
          <div className="flex shrink-0 flex-col items-end gap-1 text-right">
            {trailing}
          </div>
        )}
      </div>

      {visibleFields.length > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
          {visibleFields.map((field, index) => (
            <div key={index} className="min-w-0">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {field.label}
              </dt>
              <dd className="mt-0.5 truncate text-sm text-foreground">
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {actions != null && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
          {actions}
        </div>
      )}
    </div>
  );
}
