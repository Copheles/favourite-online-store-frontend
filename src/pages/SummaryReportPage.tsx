import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
  Banknote,
  CreditCard,
  Landmark,
  Package,
  Receipt,
  ShoppingCart,
  Smartphone,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ErrorState, PageHeader } from "@/components/shared/PageStates";
import { PosPageShell } from "@/components/shared/pos/PosPageShell";
import { StatCard } from "@/components/shared/pos/StatCard";
import { PosToolbar } from "@/components/shared/pos/PosToolbar";
import { TableSkeleton } from "@/components/shared/pos/TableSkeleton";
import { useUrlStringParam } from "@/hooks/useUrlQuery";
import { useCashSummary } from "@/hooks/useReports";
import { formatMoney, todayISO, toMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PaymentSummaryItem, PaymentType } from "@/types/api";
import {
  getDateFilterSchema,
  type DateFilterValues,
} from "@/validation/filter.validation";

const PAYMENT_ICONS: Record<PaymentType, LucideIcon> = {
  CASH: Banknote,
  KBZPAY: Smartphone,
  WAVEPAY: Smartphone,
  CARD: CreditCard,
  BANKING: Landmark,
};

export function SummaryReportPage() {
  const { t } = useTranslation();
  const defaultDate = todayISO();
  const [date, setDate] = useUrlStringParam("date", defaultDate);

  const filterSchema = useMemo(() => getDateFilterSchema(), []);
  const filterForm = useForm<DateFilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: { date },
  });

  useEffect(() => {
    filterForm.reset({ date });
  }, [date, filterForm]);

  const query = useCashSummary({ date: date || defaultDate });
  const data = query.data;

  const paymentTotal =
    data?.paymentSummary.reduce((sum, item) => sum + toMoney(item.amount), 0) ??
    0;

  return (
    <PosPageShell>
      <PageHeader
        title={t("pos.modules.summaryReport")}
        description={t("pos.reports.summaryDescription")}
      />

      <PosToolbar>
        <Form {...filterForm}>
          <FormField
            control={filterForm.control}
            name="date"
            render={({ field }) => (
              <FormItem className="max-w-xs">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  {t("pos.reports.date")}
                </label>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    onChange={(event) => {
                      field.onChange(event);
                      setDate(event.target.value, { resetPage: false });
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
      </PosToolbar>

      {query.isLoading && !data && <TableSkeleton rows={4} cols={2} />}
      {query.isError && <ErrorState />}

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <StatCard
              icon={ShoppingCart}
              label={t("pos.reports.orderCount")}
              value={data.orderCount}
            />
            <StatCard
              icon={Package}
              label={t("pos.reports.soldQty")}
              value={data.soldItemQty}
            />
            <StatCard
              icon={Wallet}
              label={t("pos.reports.cashInHand")}
              value={formatMoney(data.cashInHand)}
              accent
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-card sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Receipt className="size-4" />
                </span>
                <h3 className="font-bold text-foreground">
                  {t("pos.reports.salesSummary")}
                </h3>
              </div>
              <dl className="mt-4 space-y-2.5 text-sm">
                <SummaryRow
                  label={t("pos.reports.gross")}
                  value={formatMoney(data.salesTotal)}
                />
                {toMoney(data.itemDiscount) > 0 && (
                  <SummaryRow
                    label={t("pos.reports.itemDiscount")}
                    value={formatMoney(data.itemDiscount)}
                    negative
                  />
                )}
                {toMoney(data.orderDiscount) > 0 && (
                  <SummaryRow
                    label={t("pos.reports.orderDiscount")}
                    value={formatMoney(data.orderDiscount)}
                    negative
                  />
                )}
                {toMoney(data.deliveryFee) > 0 && (
                  <SummaryRow
                    label={t("pos.reports.deliveryFee")}
                    value={formatMoney(data.deliveryFee)}
                  />
                )}
                {toMoney(data.taxAmount) > 0 && (
                  <SummaryRow
                    label={t("pos.reports.tax")}
                    value={formatMoney(data.taxAmount)}
                  />
                )}
                <div className="h-px bg-border/60" />
                <SummaryRow
                  label={t("pos.reports.netSales")}
                  value={formatMoney(data.netSalesTotal)}
                  medium
                />
                {toMoney(data.totalExpenses) > 0 && (
                  <SummaryRow
                    label={t("pos.reports.expenses")}
                    value={formatMoney(data.totalExpenses)}
                    negative
                  />
                )}
                <div className="rounded-lg bg-accent px-3 py-2.5">
                  <SummaryRow
                    label={t("pos.reports.cashInHand")}
                    value={formatMoney(data.cashInHand)}
                    strong
                  />
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-card sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Wallet className="size-4" />
                </span>
                <h3 className="font-bold text-foreground">
                  {t("pos.reports.paymentBreakdown")}
                </h3>
              </div>
              {data.paymentSummary.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  {t("pos.reports.noPayments")}
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {data.paymentSummary.map((item) => (
                    <PaymentBar
                      key={item.paymentType}
                      item={item}
                      total={paymentTotal}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {data.expenseSummary.length > 0 && (
            <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-card sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Banknote className="size-4" />
                </span>
                <h3 className="font-bold text-foreground">
                  {t("pos.reports.expenseBreakdown")}
                </h3>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {data.expenseSummary.map((item) => (
                  <div
                    key={item.paymentType}
                    className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.paymentType}
                    </span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatMoney(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PosPageShell>
  );
}

function SummaryRow({
  label,
  value,
  negative,
  medium,
  strong,
}: {
  label: string;
  value: string;
  negative?: boolean;
  medium?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt
        className={cn(
          "text-muted-foreground",
          strong && "font-semibold text-foreground",
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          "font-medium tabular-nums text-foreground",
          negative && "text-rose-600 dark:text-rose-400",
          medium && "font-semibold",
          strong && "text-lg font-bold text-primary",
        )}
      >
        {negative ? "\u2212" : ""}
        {value}
      </dd>
    </div>
  );
}

function PaymentBar({
  item,
  total,
}: {
  item: PaymentSummaryItem;
  total: number;
}) {
  const { t } = useTranslation();
  const Icon = PAYMENT_ICONS[item.paymentType] ?? Wallet;
  const amount = toMoney(item.amount);
  const percent = total > 0 ? Math.round((amount / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {item.paymentType}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("pos.reports.transactions", { count: item.count })}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold tabular-nums text-foreground">
            {formatMoney(item.amount)}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {percent}%
          </p>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb,#3b82f6)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
