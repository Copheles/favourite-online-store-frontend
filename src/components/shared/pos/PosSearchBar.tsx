import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PosSearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder,
  className,
  inputClassName,
  buttonLabel,
  hideButton = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  buttonLabel?: string;
  hideButton?: boolean;
}) {
  const { t } = useTranslation();
  const hasValue = value.length > 0;

  function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();
    onSubmit();
  }

  function handleClear() {
    onChange("");
    onClear?.();
  }

  return (
    <div
      className={cn(
        "flex w-full min-w-0 gap-2 sm:max-w-xl lg:max-w-2xl xl:max-w-7xl",
        className,
      )}
    >
      <div className={cn("relative min-w-0 flex-1", inputClassName)}>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSubmit();
            }
          }}
          placeholder={placeholder}
          className={cn("pl-10", hasValue && "pr-9")}
        />
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t("pos.common.clear")}
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      {!hideButton && (
        <Button
          type="button"
          className="shrink-0 gap-2 px-4"
          onClick={() => handleSubmit()}
        >
          <Search className="size-4" />
          <span>{buttonLabel ?? t("pos.common.search")}</span>
        </Button>
      )}
    </div>
  );
}
