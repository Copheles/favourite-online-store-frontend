import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const EMPTY_VALUE = "__radix_select_empty__";

type SelectOption = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
};

function parseOptions(children: React.ReactNode): SelectOption[] {
  const options: SelectOption[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child) || child.type !== "option") {
      return;
    }

    const {
      value,
      disabled,
      children: label,
    } = child.props as React.ComponentProps<"option">;

    options.push({
      value: value != null ? String(value) : "",
      label: label ?? value ?? "",
      disabled,
    });
  });

  return options;
}

function toInternalValue(value: string | undefined | null): string {
  if (value === "" || value == null) {
    return EMPTY_VALUE;
  }

  return String(value);
}

function toExternalValue(value: string): string {
  return value === EMPTY_VALUE ? "" : value;
}

type SelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: SelectSize;
};

export type SelectSize = "default" | "sm";

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      children,
      value,
      defaultValue,
      onChange,
      onBlur,
      disabled,
      id,
      name,
      size = "default",
      "aria-label": ariaLabel,
    },
    ref,
  ) => {
    const options = React.useMemo(() => parseOptions(children), [children]);
    const selectedValue = value !== undefined ? String(value) : undefined;
    const internalValue =
      selectedValue !== undefined ? toInternalValue(selectedValue) : undefined;
    const placeholderOption = options.find((option) => option.value === "");
    const placeholder =
      placeholderOption?.label != null
        ? String(placeholderOption.label)
        : undefined;

    const handleValueChange = (next: string) => {
      const external = toExternalValue(next);

      onChange?.({
        target: { value: external, name: name ?? "" },
        currentTarget: { value: external, name: name ?? "" },
      } as React.ChangeEvent<HTMLSelectElement>);
    };

    const handleOpenChange = (open: boolean) => {
      if (!open) {
        onBlur?.({
          target: { value: selectedValue ?? "", name: name ?? "" },
          currentTarget: { value: selectedValue ?? "", name: name ?? "" },
        } as React.FocusEvent<HTMLSelectElement>);
      }
    };

    return (
      <div
        className={cn(
          "relative w-full min-w-0",
          size === "sm" ? "min-h-8 xl:min-h-9" : "min-h-10",
          className,
        )}
      >
        <SelectPrimitive.Root
          value={internalValue}
          defaultValue={
            defaultValue !== undefined
              ? toInternalValue(String(defaultValue))
              : undefined
          }
          onValueChange={handleValueChange}
          onOpenChange={handleOpenChange}
          disabled={disabled}
          name={name}
        >
          <SelectPrimitive.Trigger
            ref={ref}
            id={id}
            aria-label={ariaLabel}
            className={cn(
              "relative flex h-full w-full min-w-0 items-center rounded-lg border border-input bg-background py-2 pl-3 pr-9 leading-normal shadow-xs transition-all hover:border-ring/40 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground",
              size === "sm"
                ? "text-xs lg:text-xs xl:text-sm"
                : "text-sm",
            )}
          >
            <SelectPrimitive.Value
              className="min-w-0 flex-1 truncate text-left"
              placeholder={placeholder}
            />
            <SelectPrimitive.Icon asChild>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              position="popper"
              sideOffset={4}
              className="z-50 max-h-60 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md"
            >
              <SelectPrimitive.Viewport className="max-h-60 overflow-y-auto p-1">
                {options.map((option) => {
                  const itemValue =
                    option.value === "" ? EMPTY_VALUE : option.value;

                  return (
                    <SelectPrimitive.Item
                      key={itemValue}
                      value={itemValue}
                      disabled={option.disabled}
                      className={cn(
                        "relative flex w-full cursor-default select-none items-center rounded-md pl-8 pr-2 outline-none focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                        size === "sm"
                          ? "py-1.5 text-xs xl:py-2 xl:text-sm"
                          : "py-2 text-sm",
                      )}
                    >
                      <span className="absolute left-2 flex size-3.5 items-center justify-center">
                        <SelectPrimitive.ItemIndicator>
                          <Check className="size-4" />
                        </SelectPrimitive.ItemIndicator>
                      </span>
                      <SelectPrimitive.ItemText>
                        {option.label}
                      </SelectPrimitive.ItemText>
                    </SelectPrimitive.Item>
                  );
                })}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };
