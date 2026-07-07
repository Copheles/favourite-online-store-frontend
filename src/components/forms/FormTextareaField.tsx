import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

interface FormTextareaFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function FormTextareaField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  rows = 3,
  className,
}: FormTextareaFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-xs font-semibold text-muted-foreground">
            {label}
          </FormLabel>
          <FormControl>
            <Textarea
              rows={rows}
              placeholder={placeholder}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
