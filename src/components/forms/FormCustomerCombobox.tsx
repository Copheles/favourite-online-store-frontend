import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CustomerCombobox } from "@/components/shared/pos/CustomerCombobox";
import type { Customer } from "@/types/api";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

interface FormCustomerComboboxProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  walkInLabel: string;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  controlClassName?: string;
  onCustomerChange?: (customer: Customer | undefined) => void;
}

export function FormCustomerCombobox<T extends FieldValues>({
  control,
  name,
  label,
  walkInLabel,
  placeholder,
  className,
  labelClassName,
  controlClassName,
  onCustomerChange,
}: FormCustomerComboboxProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel
            className={cn(
              "text-xs font-semibold text-muted-foreground",
              labelClassName,
            )}
          >
            {label}
          </FormLabel>
          <FormControl>
            <CustomerCombobox
              value={field.value ?? ""}
              walkInLabel={walkInLabel}
              placeholder={placeholder}
              className={controlClassName}
              onChange={(customerId, customer) => {
                field.onChange(customerId);
                onCustomerChange?.(customer);
              }}
            />
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
