import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { useBranch } from "@/hooks/useBranch";
import { cn } from "@/lib/utils";

export function BranchSwitcher() {
  const { t } = useTranslation();
  const {
    currentBranch,
    accessibleBranches,
    canSwitchBranch,
    switchBranch,
  } = useBranch();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!currentBranch) {
    return null;
  }

  if (!canSwitchBranch) {
    return (
      <div
        className="mr-1 flex max-w-[9.5rem] items-center gap-1.5 rounded-lg px-2 py-1.5 sm:max-w-[12rem]"
        title={currentBranch.name}
      >
        <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold leading-tight text-foreground">
            {currentBranch.name}
          </p>
          <p className="truncate text-[10px] leading-tight text-muted-foreground">
            {currentBranch.code}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mr-1" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex max-w-[10.5rem] items-center gap-1.5 rounded-lg py-1 pl-1.5 pr-1.5 text-left transition-colors hover:bg-muted sm:max-w-[13rem] sm:pr-2",
          open && "bg-muted",
        )}
        aria-label={t("header.selectBranch")}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <MapPin className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-semibold leading-tight text-foreground">
            {currentBranch.name}
          </span>
          <span className="hidden truncate text-[10px] leading-tight text-muted-foreground sm:block">
            {currentBranch.code}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("header.selectBranch")}
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-border bg-card p-1.5 shadow-sm"
        >
          <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("header.branch")}
          </p>
          <div className="max-h-64 space-y-0.5 overflow-y-auto">
            {accessibleBranches.map((branch) => {
              const selected = branch.id === currentBranch.id;
              return (
                <button
                  key={branch.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    switchBranch(branch.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                    selected
                      ? "bg-muted text-foreground"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    {selected && <Check className="size-4 text-primary" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {branch.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {branch.code}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
