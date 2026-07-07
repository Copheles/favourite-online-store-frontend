import { useTranslation } from "react-i18next";
import type { OrderStatus } from "@/types/api";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<OrderStatus, string> = {
  COMPLETED: "bg-success text-success-foreground",
  PROCESSING: "bg-warning text-warning-foreground",
  CANCELLED: "bg-destructive/10 text-destructive",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
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
      {t(`pos.orders.statusLabel.${status}`)}
    </span>
  );
}
