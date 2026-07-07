import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

const baseInputClassName =
  "flex h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm leading-normal text-foreground shadow-xs transition-all placeholder:text-muted-foreground/80 hover:border-ring/40 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  if (type === "date") {
    const { value, onChange, disabled, id, "aria-label": ariaLabel, placeholder } =
      props;

    return (
      <DatePicker
        value={typeof value === "string" ? value : ""}
        onChange={onChange}
        disabled={disabled}
        id={id}
        aria-label={ariaLabel}
        placeholder={placeholder}
        className={className}
      />
    );
  }

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(baseInputClassName, className)}
      {...props}
    />
  );
}

export { Input };
