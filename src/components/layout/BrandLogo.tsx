import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  onClick?: () => void;
  compact?: boolean;
  variant?: "default" | "header";
}

function BrandWordmark({
  showBadge = true,
  showSubtitle = true,
  size = "md",
}: {
  showBadge?: boolean;
  showSubtitle?: boolean;
  size?: "sm" | "md";
}) {
  const { t } = useTranslation();

  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-2">
        <p
          className={cn(
            "truncate font-bold tracking-tight",
            size === "sm" ? "text-sm" : "text-[15px] sm:text-base",
          )}
        >
          <span className="bg-gradient-to-r from-[#1e3a8a] via-primary to-[#3b82f6] bg-clip-text text-transparent dark:from-[#93c5fd] dark:via-[#60a5fa] dark:to-[#3b82f6]">
            {t("pos.header.storeName")}
          </span>
        </p>
        {showBadge && (
          <span className="hidden shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-primary sm:inline-flex">
            POS
          </span>
        )}
      </div>
      {showSubtitle && (
        <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {t("pos.header.subtitle")}
        </p>
      )}
    </div>
  );
}

export function BrandLogo({
  className,
  onClick,
  compact = false,
  variant = "default",
}: BrandLogoProps) {
  const Wrapper = onClick ? "button" : "div";

  const focusClass = onClick
    ? "rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
    : "";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn("min-w-0 text-left", focusClass, className)}
    >
      <BrandWordmark
        showBadge={variant === "header" && !compact}
        showSubtitle={!compact}
        size={compact ? "sm" : "md"}
      />
    </Wrapper>
  );
}
