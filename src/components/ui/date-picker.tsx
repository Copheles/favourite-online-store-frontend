import { useState } from "react";
import { Popover } from "radix-ui";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  formatISODateDisplay,
  parseISODate,
  toISODateString,
} from "@/lib/format";
import { cn } from "@/lib/utils";

const triggerClassName =
  "relative flex h-10 w-full min-w-0 items-center rounded-lg border border-input bg-background py-2 pl-3 pr-9 text-left text-sm leading-normal shadow-xs transition-all hover:border-ring/40 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50";

interface DatePickerProps
  extends Omit<React.ComponentProps<"button">, "value" | "onChange" | "type"> {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

function DatePicker({
  value = "",
  onChange,
  placeholder = "Select date",
  className,
  disabled,
  id,
  "aria-label": ariaLabel,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseISODate(value);
  const displayValue = value ? formatISODateDisplay(value) : "";

  function emitChange(nextValue: string) {
    onChange?.({
      target: { value: nextValue },
    } as React.ChangeEvent<HTMLInputElement>);
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(triggerClassName, className)}
          {...props}
        >
          <span
            className={cn(
              "min-w-0 flex-1 truncate",
              !displayValue && "text-muted-foreground/80",
            )}
          >
            {displayValue || placeholder}
          </span>
          <CalendarIcon className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-lg outline-none animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
        >
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => {
              emitChange(date ? toISODateString(date) : "");
              setOpen(false);
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export { DatePicker };
