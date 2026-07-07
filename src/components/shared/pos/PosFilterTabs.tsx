import { cn } from "@/lib/utils";

type FilterAlign = "start" | "end" | "stretch";

export function PosFilterTabs<T extends string>({
  value,
  options,
  onChange,
  getLabel,
  className,
  align = "start",
}: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  getLabel: (value: T) => string;
  className?: string;
  align?: FilterAlign;
}) {
  return (
    <div
      className={cn(
        "max-w-full",
        align === "end" && "flex w-full justify-end sm:w-auto",
        align === "stretch" && "w-full",
        className,
      )}
    >
      <div
        className={cn(
          "inline-flex max-w-full gap-0.5 overflow-x-auto rounded-xl border border-border/70 bg-muted/25 p-1 shadow-sm",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          align === "stretch" && "w-full",
        )}
        role="tablist"
      >
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(option)}
              className={cn(
                "shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold leading-none transition-[color,background-color,box-shadow] duration-150 sm:px-3 sm:text-xs",
                active
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                  : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
              )}
            >
              {getLabel(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
