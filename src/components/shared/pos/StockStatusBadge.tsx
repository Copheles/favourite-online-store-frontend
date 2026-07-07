import { useTranslation } from "react-i18next";
import type { StockStatus } from "@/types/api";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<StockStatus, string> = {
  OUT_OF_STOCK: "bg-destructive/10 text-destructive",
  LOW_STOCK: "bg-warning text-warning-foreground",
  IN_STOCK: "bg-success text-success-foreground",
};

export function StockStatusBadge({
  status,
  className,
}: {
  status: StockStatus;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
        STATUS_STYLES[status],
        className,
      )}
    >
      {t(`pos.filters.stock.${status}`)}
    </span>
  );
}
