import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

interface FormTextFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  type?: string;
  placeholder?: string;
  min?: number;
}

export function FormTextField<T extends FieldValues>({
  control,
  name,
  label,
  type = "text",
  placeholder,
  min,
}: FormTextFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs font-semibold text-muted-foreground">
            {label}
          </FormLabel>
          <FormControl>
            <Input
              type={type}
              min={min}
              placeholder={placeholder}
              {...field}
              value={field.value ?? ""}
              onChange={(event) => {
                if (type === "number") {
                  const next = event.target.value;
                  field.onChange(next === "" ? 0 : Number(next));
                  return;
                }
                field.onChange(event.target.value);
              }}
            />
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
