import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Popover } from "radix-ui";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useCustomer, useCustomers } from "@/hooks/useCustomers";
import type { Customer } from "@/types/api";
import { cn } from "@/lib/utils";

interface CustomerComboboxProps {
  value: string;
  onChange: (customerId: string, customer?: Customer) => void;
  walkInLabel: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function CustomerCombobox({
  value,
  onChange,
  walkInLabel,
  placeholder,
  disabled,
  id,
  className,
}: CustomerComboboxProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);

  const customersQuery = useCustomers(
    {
      search: debouncedSearch || undefined,
      page: 1,
      limit: 20,
      isActive: true,
    },
    { enabled: open },
  );
  const selectedCustomerQuery = useCustomer(value || undefined);

  const customers = customersQuery.data?.items ?? [];
  const isWalkIn = !value;

  const displayLabel = useMemo(() => {
    if (isWalkIn) return walkInLabel;
    return selectedCustomerQuery.data?.name ?? walkInLabel;
  }, [isWalkIn, selectedCustomerQuery.data?.name, walkInLabel]);

  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setSearch("");
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            "relative flex h-10 w-full min-w-0 items-center rounded-lg border border-input bg-background py-2 pl-3 pr-9 text-left text-sm leading-normal shadow-xs transition-all hover:border-ring/40 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span className="min-w-0 flex-1 truncate text-foreground">
            {displayLabel}
          </span>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 w-(--radix-popover-trigger-width) overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md"
        >
          <div className="border-b border-border/60 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={placeholder ?? t("pos.members.searchPlaceholder")}
                className="h-9 pl-9"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto p-1">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted",
                isWalkIn && "bg-muted/60",
              )}
            >
              <span className="flex size-4 shrink-0 items-center justify-center">
                {isWalkIn && <Check className="size-4 text-primary" />}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                {walkInLabel}
              </span>
            </button>

            {customersQuery.isLoading && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                {t("pos.common.loading")}
              </div>
            )}

            {!customersQuery.isLoading && customers.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {t("pos.members.empty")}
              </p>
            )}

            {!customersQuery.isLoading &&
              customers.map((customer) => {
                const isSelected = customer.id === value;
                return (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => {
                      onChange(customer.id, customer);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted",
                      isSelected && "bg-muted/60",
                    )}
                  >
                    <span className="flex size-4 shrink-0 items-center justify-center">
                      {isSelected && <Check className="size-4 text-primary" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-foreground">
                        {customer.name}
                      </span>
                      {customer.phone && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {customer.phone}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
