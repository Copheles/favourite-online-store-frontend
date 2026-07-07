import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const fieldClassName =
  "h-12 rounded-xl border border-input/70 bg-muted text-sm text-foreground shadow-none transition-all placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/20 dark:border-input dark:bg-secondary dark:focus-visible:bg-card";

interface LoginFieldProps extends ComponentProps<"input"> {
  icon: LucideIcon;
  trailing?: React.ReactNode;
}

export function LoginField({
  icon: Icon,
  trailing,
  className,
  ...props
}: LoginFieldProps) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-muted-foreground" />
      <Input
        className={cn(fieldClassName, trailing ? "pl-10 pr-16" : "pl-10", className)}
        {...props}
      />
      {trailing}
    </div>
  );
}

export { fieldClassName as loginFieldClassName };
