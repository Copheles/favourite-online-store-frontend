import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  EmptyState,
  ErrorState,
  PageHeader,
} from "@/components/shared/PageStates";
import {
  PosDataTable,
  PosTable,
  PosTableBody,
  PosTableCell,
  PosTableHead,
  PosTableHeaderCell,
  PosTableRow,
} from "@/components/shared/pos/PosDataTable";
import { PosModal } from "@/components/shared/pos/PosModal";
import { PosPageShell } from "@/components/shared/pos/PosPageShell";
import {
  PosRecordCard,
  PosRecordCardList,
} from "@/components/shared/pos/PosRecordCard";
import { PosPagination } from "@/components/shared/pos/PosPagination";
import { PosFilterSelect } from "@/components/shared/pos/PosFilterSelect";
import { PosSearchBar } from "@/components/shared/pos/PosSearchBar";
import { PosToaster, usePosToast } from "@/components/shared/pos/PosToast";
import { PosToolbar, PosToolbarActions, PosToolbarGroup } from "@/components/shared/pos/PosToolbar";
import { TableSkeleton } from "@/components/shared/pos/TableSkeleton";
import { OrderStatusBadge } from "@/components/shared/pos/OrderStatusBadge";
import { useUrlEnumParam, useUrlLimit, useUrlPage } from "@/hooks/useUrlQuery";
import {
  useOrder,
  useOrderReceipt,
  useOrders,
  useUpdateOrderStatus,
} from "@/hooks/useOrders";
import { formatDateTime, formatMoney, toMoney, todayISO } from "@/lib/format";
import {
  ORDER_STATUS_FILTERS,
  PAYMENT_FILTERS,
  orderStatusFilterToApi,
  paymentFilterToApi,
  type OrderStatusFilter,
  type PaymentFilter,
} from "@/lib/listFilters";
import type { OrderStatus } from "@/types/api";
import {
  getOrderCashierName,
  getOrderDate,
  getOrderTotals,
} from "@/lib/order";
import { PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/queryConfig";
import {
  readUrlString,
  resetUrlPage,
  writeUrlString,
} from "@/lib/urlQuery";
import type { OrderDetail, OrderListItem, OrderReceipt } from "@/types/api";
import { cn } from "@/lib/utils";
import {
  getDateRangeFilterSchema,
  type DateRangeFilterValues,
} from "@/validation/filter.validation";

export function OrdersPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const isHistory = location.pathname.includes("/completed");
  const isPending = location.pathname.includes("/pending");
  const mode = isPending ? "pending" : isHistory ? "history" : "current";
  const useToday = mode === "current";
  const defaultFrom = useToday ? todayISO() : "";
  const defaultTo = useToday ? todayISO() : "";
  const [searchParams, setSearchParams] = useSearchParams();
  const { toasts, showToast, dismiss } = usePosToast();
  const updateStatus = useUpdateOrderStatus();
  const [page, setPage] = useUrlPage();
  const [limit, setLimit] = useUrlLimit(
    PAGE_SIZE.default,
    PAGE_SIZE_OPTIONS.orders,
  );
  const [paymentFilter, setPaymentFilter] = useUrlEnumParam<PaymentFilter>(
    "payment",
    "ALL",
    PAYMENT_FILTERS,
  );
  const [statusFilter, setStatusFilter] = useUrlEnumParam<OrderStatusFilter>(
    "status",
    "ALL",
    ORDER_STATUS_FILTERS,
  );
  const statusParam: OrderStatus | undefined = isPending
    ? "PROCESSING"
    : isHistory
      ? "COMPLETED"
      : orderStatusFilterToApi(statusFilter);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const prevModeRef = useRef(mode);

  const appliedSearch = readUrlString(searchParams, "q");
  const fromDate = readUrlString(searchParams, "from", defaultFrom);
  const toDate = readUrlString(searchParams, "to", defaultTo);

  const filterSchema = useMemo(() => getDateRangeFilterSchema(), []);
  const filterForm = useForm<DateRangeFilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: appliedSearch,
      fromDate,
      toDate,
    },
  });

  useEffect(() => {
    filterForm.reset({
      search: appliedSearch,
      fromDate,
      toDate,
    });
  }, [appliedSearch, fromDate, toDate, filterForm]);

  useEffect(() => {
    if (prevModeRef.current === mode) return;
    prevModeRef.current = mode;

    setSearchParams(
      () => {
        const next = new URLSearchParams();
        if (useToday) {
          writeUrlString(next, "from", todayISO(), "");
          writeUrlString(next, "to", todayISO(), "");
        }
        return next;
      },
      { replace: true },
    );
  }, [mode, useToday, setSearchParams]);

  const ordersQuery = useOrders({
    search: appliedSearch || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    paymentType: paymentFilterToApi(paymentFilter),
    status: statusParam,
    page,
    limit,
  });

  const detailQuery = useOrder(selectedId);
  const receiptQuery = useOrderReceipt(showReceipt ? selectedId : null);

  const title = isPending
    ? t("pos.modules.pendingOrders")
    : isHistory
      ? t("pos.modules.orderHistory")
      : t("pos.modules.currentOrder");

  const description = isPending
    ? t("pos.orders.pendingDescription")
    : isHistory
      ? t("pos.orders.historyDescription")
      : t("pos.orders.todayDescription");

  const rows = ordersQuery.data?.items ?? [];
  const totalPages = ordersQuery.data?.meta.totalPages ?? 1;

  function handleComplete(id: string) {
    updateStatus.mutate(
      { id, status: "COMPLETED" },
      { onSuccess: () => showToast("success", t("pos.orders.completedToast")) },
    );
  }

  function handleCancel(id: string) {
    if (!window.confirm(t("pos.orders.cancelConfirm"))) return;
    updateStatus.mutate(
      { id, status: "CANCELLED" },
      { onSuccess: () => showToast("success", t("pos.orders.cancelledToast")) },
    );
  }

  function renderRowActions(row: OrderListItem) {
    return (
      <>
        {row.status === "PROCESSING" && (
          <>
            <Button
              size="sm"
              variant="default"
              disabled={updateStatus.isPending}
              onClick={() => handleComplete(row.id)}
            >
              {t("pos.orders.complete")}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={updateStatus.isPending}
              onClick={() => handleCancel(row.id)}
            >
              {t("pos.orders.cancel")}
            </Button>
          </>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedId(row.id);
            setShowReceipt(false);
          }}
        >
          {t("pos.orders.view")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setSelectedId(row.id);
            setShowReceipt(true);
          }}
        >
          {t("pos.orders.receipt")}
        </Button>
      </>
    );
  }

  function applyFilters() {
    const values = filterForm.getValues();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      writeUrlString(next, "q", values.search ?? "");
      writeUrlString(next, "from", values.fromDate ?? "", defaultFrom);
      writeUrlString(next, "to", values.toDate ?? "", defaultTo);
      resetUrlPage(next);
      return next;
    });
  }

  function resetFilters() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("q");
      next.delete("payment");
      next.delete("status");
      writeUrlString(next, "from", defaultFrom, defaultFrom);
      writeUrlString(next, "to", defaultTo, defaultTo);
      resetUrlPage(next);
      return next;
    });
  }

  function clearSearch() {
    filterForm.setValue("search", "");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("q");
      resetUrlPage(next);
      return next;
    });
  }

  function updateDateParam(key: "from" | "to", value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const defaultValue = key === "from" ? defaultFrom : defaultTo;
      writeUrlString(next, key, value, defaultValue);
      resetUrlPage(next);
      return next;
    });
  }

  return (
    <PosPageShell>
      <PageHeader title={title} description={description} />

      <PosToolbar>
        <Form {...filterForm}>
          <PosToolbarGroup>
            <PosSearchBar
              value={filterForm.watch("search") ?? ""}
              onChange={(value) => filterForm.setValue("search", value)}
              onSubmit={applyFilters}
              onClear={clearSearch}
              placeholder={t("pos.orders.searchPlaceholder")}
              className="w-full min-w-0 lg:col-span-2"
            />
            <FormField
              control={filterForm.control}
              name="fromDate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      onChange={(event) => {
                        field.onChange(event);
                        updateDateParam("from", event.target.value);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={filterForm.control}
              name="toDate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      onChange={(event) => {
                        field.onChange(event);
                        updateDateParam("to", event.target.value);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </PosToolbarGroup>
        </Form>
        <PosToolbarActions>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            {t("pos.common.reset")}
          </Button>
        </PosToolbarActions>
      </PosToolbar>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {mode === "current" && (
          <PosFilterSelect
            value={statusFilter}
            options={ORDER_STATUS_FILTERS}
            onChange={setStatusFilter}
            ariaLabel={t("pos.orders.status")}
            getLabel={(value) =>
              value === "ALL"
                ? t("pos.filters.status.ALL")
                : t(`pos.orders.statusLabel.${value}`)
            }
          />
        )}

        <PosFilterSelect
          value={paymentFilter}
          options={PAYMENT_FILTERS}
          onChange={setPaymentFilter}
          ariaLabel={t("pos.orders.payment")}
          getLabel={(value) => t(`pos.filters.payment.${value}`)}
        />
      </div>

      {ordersQuery.isLoading && !ordersQuery.data && (
        <TableSkeleton rows={8} cols={8} />
      )}
      {ordersQuery.isError && <ErrorState />}
      {!ordersQuery.isLoading && rows.length === 0 && (
        <EmptyState message={t("pos.orders.empty")} />
      )}

      {!ordersQuery.isLoading && rows.length > 0 && (
        <>
          <PosRecordCardList>
            {rows.map((row: OrderListItem) => (
              <PosRecordCard
                key={row.id}
                title={row.invoiceNumber}
                subtitle={row.customerName}
                trailing={
                  <>
                    <OrderStatusBadge status={row.status} />
                    <span className="text-sm font-semibold text-foreground">
                      {formatMoney(row.netTotal)}
                    </span>
                  </>
                }
                fields={[
                  { label: t("pos.orders.payment"), value: row.paymentType ?? "-" },
                  {
                    label: t("pos.orders.date"),
                    value: formatDateTime(row.createdAt),
                  },
                  {
                    label: t("pos.sale.orderNotes"),
                    value: row.notes?.trim() ? row.notes : null,
                  },
                ]}
                actions={renderRowActions(row)}
              />
            ))}
          </PosRecordCardList>

          <PosDataTable className="hidden md:block">
            <PosTable>
              <PosTableHead>
                <tr>
                  <PosTableHeaderCell>{t("pos.orders.invoice")}</PosTableHeaderCell>
                  <PosTableHeaderCell>{t("pos.orders.customer")}</PosTableHeaderCell>
                  <PosTableHeaderCell>{t("pos.orders.total")}</PosTableHeaderCell>
                  <PosTableHeaderCell>{t("pos.orders.payment")}</PosTableHeaderCell>
                  <PosTableHeaderCell>{t("pos.orders.status")}</PosTableHeaderCell>
                  <PosTableHeaderCell>{t("pos.sale.orderNotes")}</PosTableHeaderCell>
                  <PosTableHeaderCell>{t("pos.orders.date")}</PosTableHeaderCell>
                  <PosTableHeaderCell />
                </tr>
              </PosTableHead>
              <PosTableBody>
                {rows.map((row: OrderListItem) => (
                  <PosTableRow key={row.id}>
                    <PosTableCell className="font-medium">
                      {row.invoiceNumber}
                    </PosTableCell>
                    <PosTableCell>{row.customerName}</PosTableCell>
                    <PosTableCell>{formatMoney(row.netTotal)}</PosTableCell>
                    <PosTableCell>{row.paymentType ?? "-"}</PosTableCell>
                    <PosTableCell>
                      <OrderStatusBadge status={row.status} />
                    </PosTableCell>
                    <PosTableCell className="max-w-[200px]">
                      {row.notes?.trim() ? (
                        <span
                          className="line-clamp-2 text-sm text-muted-foreground"
                          title={row.notes}
                        >
                          {row.notes}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </PosTableCell>
                    <PosTableCell>{formatDateTime(row.createdAt)}</PosTableCell>
                    <PosTableCell>
                      <div className="flex flex-wrap gap-2">
                        {renderRowActions(row)}
                      </div>
                    </PosTableCell>
                  </PosTableRow>
                ))}
              </PosTableBody>
            </PosTable>
          </PosDataTable>
        </>
      )}

      <PosPagination
        page={page}
        totalPages={totalPages}
        total={ordersQuery.data?.meta.total}
        limit={limit}
        pageSizeOptions={PAGE_SIZE_OPTIONS.orders}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
      />

      {selectedId && !showReceipt && detailQuery.data && (
        <PosModal
          title={detailQuery.data.invoiceNumber}
          description={formatDateTime(getOrderDate(detailQuery.data))}
          onClose={() => setSelectedId(null)}
          closeLabel={t("pos.common.close")}
          wide
        >
          <OrderDetailView order={detailQuery.data} />
        </PosModal>
      )}

      {selectedId && showReceipt && receiptQuery.data && (
        <PosModal
          title={t("pos.orders.receipt")}
          description={receiptQuery.data.invoiceNumber}
          onClose={() => {
            setSelectedId(null);
            setShowReceipt(false);
          }}
          closeLabel={t("pos.common.close")}
        >
          <ReceiptView receipt={receiptQuery.data} />
          <Button
            className="mt-4 w-full"
            variant="outline"
            onClick={() => window.print()}
          >
            <Printer className="size-4" />
            {t("pos.orders.print")}
          </Button>
        </PosModal>
      )}

      <PosToaster toasts={toasts} onDismiss={dismiss} />
    </PosPageShell>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-medium text-foreground">
        {value}
      </p>
    </div>
  );
}

function TotalsRow({
  label,
  value,
  negative,
  strong,
}: {
  label: string;
  value: string;
  negative?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          "text-sm text-muted-foreground",
          strong && "text-base font-semibold text-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-medium tabular-nums text-foreground",
          strong && "text-lg font-bold text-primary",
        )}
      >
        {negative ? "\u2212" : ""}
        {value}
      </span>
    </div>
  );
}

function OrderItemsList({
  items,
}: {
  items: {
    key: string;
    name: string;
    quantity: number;
    unitPrice: unknown;
    discount: unknown;
    lineTotal: unknown;
  }[];
}) {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-xl border border-border/70">
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span>{t("pos.orders.items")}</span>
        <span>{t("pos.orders.total")}</span>
      </div>
      <ul className="divide-y divide-border/60">
        {items.map((item) => {
          const unit = toMoney(item.unitPrice);
          const discount = toMoney(item.discount);
          return (
            <li
              key={item.key}
              className="flex items-start justify-between gap-3 px-4 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.name}
                </p>
                <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                  {item.quantity} {"\u00d7"} {formatMoney(unit - discount)}
                  {discount > 0 && (
                    <span className="ml-1 text-muted-foreground/60 line-through">
                      {formatMoney(unit)}
                    </span>
                  )}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                {formatMoney(item.lineTotal)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function OrderDetailView({ order }: { order: OrderDetail }) {
  const { t } = useTranslation();
  const totals = getOrderTotals(order);
  const payment = order.payment ?? order.payments?.[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
        <OrderStatusBadge status={order.status} />
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {t("pos.orders.total")}
          </p>
          <p className="text-xl font-bold tabular-nums text-primary">
            {formatMoney(totals.netTotal)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <InfoTile
          label={t("pos.orders.customer")}
          value={order.customer?.name ?? t("pos.sale.walkIn")}
        />
        <InfoTile
          label={t("pos.orders.cashier")}
          value={getOrderCashierName(order.cashier)}
        />
        {payment && (
          <InfoTile
            label={t("pos.orders.payment")}
            value={payment.paymentType}
          />
        )}
        <InfoTile
          label={t("pos.orders.date")}
          value={formatDateTime(getOrderDate(order))}
        />
      </div>

      <OrderItemsList
        items={order.items.map((item) => ({
          key: item.id,
          name: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          lineTotal: item.lineTotal,
        }))}
      />

      <div className="space-y-2 rounded-xl border border-border/70 px-4 py-3">
        <TotalsRow
          label={t("pos.sale.subtotal")}
          value={formatMoney(totals.subtotal)}
        />
        {totals.itemDiscount > 0 && (
          <TotalsRow
            label={t("pos.sale.itemDiscount")}
            value={formatMoney(totals.itemDiscount)}
            negative
          />
        )}
        {totals.orderDiscount > 0 && (
          <TotalsRow
            label={t("pos.sale.orderDiscount")}
            value={formatMoney(totals.orderDiscount)}
            negative
          />
        )}
        {totals.deliveryFee > 0 && (
          <TotalsRow
            label={t("pos.orders.deliveryFee")}
            value={formatMoney(totals.deliveryFee)}
          />
        )}
        {totals.taxAmount > 0 && (
          <TotalsRow
            label={t("pos.orders.tax")}
            value={formatMoney(totals.taxAmount)}
          />
        )}
        <div className="my-1 h-px bg-border/60" />
        <TotalsRow
          label={t("pos.orders.total")}
          value={formatMoney(totals.netTotal)}
          strong
        />
        {payment && (
          <>
            <TotalsRow
              label={t("pos.sale.paidAmount")}
              value={formatMoney(payment.paidAmount)}
            />
            {toMoney(payment.changeAmount) > 0 && (
              <TotalsRow
                label={t("pos.sale.change")}
                value={formatMoney(payment.changeAmount)}
              />
            )}
          </>
        )}
      </div>

      {order.notes?.trim() && (
        <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("pos.sale.orderNotes")}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
            {order.notes}
          </p>
        </div>
      )}
    </div>
  );
}

function ReceiptView({ receipt }: { receipt: OrderReceipt }) {
  const { t } = useTranslation();
  const totals = receipt.totals;
  const payment = receipt.payments?.[0];

  return (
    <div
      id="receipt-print"
      className="mx-auto max-w-sm rounded-xl border border-dashed border-border bg-card px-5 py-5 text-sm"
    >
      <div className="text-center">
        <p className="text-base font-bold text-foreground">
          {receipt.shopInfo.name}
        </p>
        {receipt.shopInfo.address && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {receipt.shopInfo.address}
          </p>
        )}
        {receipt.shopInfo.phone && (
          <p className="text-xs text-muted-foreground">
            {receipt.shopInfo.phone}
          </p>
        )}
      </div>

      <div className="my-3 border-t border-dashed border-border" />

      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">{t("pos.orders.invoice")}</span>
          <span className="font-medium text-foreground">
            {receipt.invoiceNumber}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">{t("pos.orders.date")}</span>
          <span className="font-medium text-foreground">
            {formatDateTime(receipt.date)}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">{t("pos.orders.customer")}</span>
          <span className="font-medium text-foreground">
            {receipt.customer.name}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">{t("pos.orders.cashier")}</span>
          <span className="font-medium text-foreground">
            {getOrderCashierName(receipt.cashier)}
          </span>
        </div>
      </div>

      <div className="my-3 border-t border-dashed border-border" />

      <ul className="space-y-2">
        {receipt.items.map((item, idx) => (
          <li key={idx} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-foreground">{item.productName}</p>
              <p className="text-xs tabular-nums text-muted-foreground">
                {item.quantity} {"\u00d7"}{" "}
                {formatMoney(toMoney(item.unitPrice) - toMoney(item.discount))}
              </p>
            </div>
            <span className="shrink-0 font-medium tabular-nums text-foreground">
              {formatMoney(item.totalAmount)}
            </span>
          </li>
        ))}
      </ul>

      <div className="my-3 border-t border-dashed border-border" />

      <div className="space-y-1.5">
        <TotalsRow
          label={t("pos.sale.subtotal")}
          value={formatMoney(totals.subtotal)}
        />
        {toMoney(totals.itemDiscount) > 0 && (
          <TotalsRow
            label={t("pos.sale.itemDiscount")}
            value={formatMoney(totals.itemDiscount)}
            negative
          />
        )}
        {toMoney(totals.orderDiscount) > 0 && (
          <TotalsRow
            label={t("pos.sale.orderDiscount")}
            value={formatMoney(totals.orderDiscount)}
            negative
          />
        )}
        {toMoney(totals.deliveryFee) > 0 && (
          <TotalsRow
            label={t("pos.orders.deliveryFee")}
            value={formatMoney(totals.deliveryFee)}
          />
        )}
        {toMoney(totals.taxAmount) > 0 && (
          <TotalsRow
            label={t("pos.orders.tax")}
            value={formatMoney(totals.taxAmount)}
          />
        )}
        <div className="my-1 border-t border-dashed border-border" />
        <TotalsRow
          label={t("pos.orders.total")}
          value={formatMoney(totals.netTotal)}
          strong
        />
        {payment && (
          <>
            <TotalsRow
              label={t("pos.sale.paidAmount")}
              value={formatMoney(payment.paidAmount)}
            />
            {toMoney(payment.changeAmount) > 0 && (
              <TotalsRow
                label={t("pos.sale.change")}
                value={formatMoney(payment.changeAmount)}
              />
            )}
          </>
        )}
      </div>

      {receipt.notes?.trim() && (
        <>
          <div className="my-3 border-t border-dashed border-border" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("pos.sale.orderNotes")}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-xs text-foreground">
              {receipt.notes}
            </p>
          </div>
        </>
      )}

      <div className="my-3 border-t border-dashed border-border" />
      <p className="text-center text-xs text-muted-foreground">
        {t("pos.orders.thankYou")}
      </p>
    </div>
  );
}
