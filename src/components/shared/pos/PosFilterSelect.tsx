import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function PosFilterSelect<T extends string>({
  value,
  options,
  onChange,
  getLabel,
  ariaLabel,
  className,
}: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  getLabel: (value: T) => string;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <Select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      className={cn("h-9 w-full sm:w-52", className)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {getLabel(option)}
        </option>
      ))}
    </Select>
  );
}
