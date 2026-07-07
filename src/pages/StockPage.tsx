import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { PosPageShell } from "@/components/shared/pos/PosPageShell";
import {
  PosRecordCard,
  PosRecordCardList,
} from "@/components/shared/pos/PosRecordCard";
import { PosFilterSelect } from "@/components/shared/pos/PosFilterSelect";
import { PosPagination } from "@/components/shared/pos/PosPagination";
import { PosSearchBar } from "@/components/shared/pos/PosSearchBar";
import {
  PosSummaryCard,
  PosSummaryCards,
} from "@/components/shared/pos/PosSummaryCards";
import { PosToolbar, PosToolbarActions, PosToolbarGroup } from "@/components/shared/pos/PosToolbar";
import { TableSkeleton } from "@/components/shared/pos/TableSkeleton";
import { RestockModal } from "@/components/shared/pos/RestockModal";
import { useAppliedSearch } from "@/hooks/useAppliedSearch";
import { useUrlEnumParam, useUrlLimit, useUrlPage, useUrlStringParam } from "@/hooks/useUrlQuery";
import { useInventoryBalance, useStockMovements } from "@/hooks/useStock";
import { formatDate, formatMoney } from "@/lib/format";
import {
  MOVEMENT_TYPE_FILTERS,
  type MovementTypeFilter,
} from "@/lib/listFilters";
import { PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/queryConfig";
import { resetUrlPage } from "@/lib/urlQuery";

const MOVEMENT_TYPE_STYLES: Record<string, string> = {
  IN: "bg-success text-success-foreground",
  OUT: "bg-destructive/10 text-destructive",
  OUT_RETURN: "bg-warning text-warning-foreground",
  REPACK: "bg-muted text-muted-foreground",
};

export function StockPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const {
    searchInput,
    setSearchInput,
    appliedSearch,
    submitSearch,
    resetSearch,
  } = useAppliedSearch();
  const [page, setPage] = useUrlPage();
  const [limit, setLimit] = useUrlLimit(PAGE_SIZE.stock, PAGE_SIZE_OPTIONS.stock);
  const [typeFilter, setTypeFilter] = useUrlEnumParam<MovementTypeFilter>(
    "type",
    "ALL",
    MOVEMENT_TYPE_FILTERS,
  );
  const [fromDate, setFromDate] = useUrlStringParam("from");
  const [toDate, setToDate] = useUrlStringParam("to");
  const [restockOpen, setRestockOpen] = useState(false);

  const summaryQuery = useInventoryBalance({
    page: 1,
    limit: 1,
    sortBy: "name",
    sortOrder: "asc",
  });
  const summary = summaryQuery.data?.summary;

  const query = useStockMovements({
    search: appliedSearch || undefined,
    type: typeFilter === "ALL" ? undefined : typeFilter,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page,
    limit,
  });

  const rows = query.data?.items ?? [];
  const totalPages = query.data?.meta.totalPages ?? 1;

  function resetFilters() {
    setSearchInput("");
    setFromDate("");
    setToDate("");
    setTypeFilter("ALL");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("q");
      next.delete("from");
      next.delete("to");
      next.delete("type");
      resetUrlPage(next);
      return next;
    });
  }

  return (
    <PosPageShell>
      <PageHeader
        title={t("pos.modules.stockList")}
        description={t("pos.stock.historyDescription")}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/products/create")}
            >
              <Plus className="size-4" />
              {t("pos.settings.addProduct")}
            </Button>
            <Button onClick={() => setRestockOpen(true)}>
              <PackagePlus className="size-4" />
              {t("pos.stock.restock")}
            </Button>
          </div>
        }
      />

      {summary && (
        <PosSummaryCards>
          <PosSummaryCard
            label={t("pos.stock.totalProducts")}
            value={summary.totalProducts}
          />
          <PosSummaryCard
            label={t("pos.stock.totalQty")}
            value={summary.totalStockQty}
          />
          <PosSummaryCard
            label={t("pos.stock.lowStock")}
            value={summary.lowStockCount}
          />
          <PosSummaryCard
            label={t("pos.stock.outOfStock")}
            value={summary.outOfStockCount}
            accent
          />
        </PosSummaryCards>
      )}

      <div>
        <h2 className="mb-3 text-lg font-bold text-foreground">
          {t("pos.stock.movementHistory")}
        </h2>
        <PosToolbar>
          <PosToolbarGroup>
            <PosSearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSubmit={submitSearch}
              onClear={resetSearch}
              placeholder={t("pos.stock.searchPlaceholder")}
              className="w-full min-w-0 max-w-none lg:col-span-2"
            />
            <Input
              type="date"
              aria-label={t("pos.stock.dateFrom")}
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
            <Input
              type="date"
              aria-label={t("pos.stock.dateTo")}
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </PosToolbarGroup>
          <PosToolbarActions>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              {t("pos.common.reset")}
            </Button>
          </PosToolbarActions>
        </PosToolbar>

        <div className="mb-4">
          <PosFilterSelect
            value={typeFilter}
            options={MOVEMENT_TYPE_FILTERS}
            onChange={setTypeFilter}
            ariaLabel={t("pos.stock.movementType")}
            getLabel={(value) => t(`pos.filters.movement.${value}`)}
          />
        </div>
      </div>

      {query.isLoading && !query.data && <TableSkeleton rows={8} cols={7} />}
      {query.isError && <ErrorState />}
      {!query.isLoading && rows.length === 0 && (
        <EmptyState message={t("pos.stock.noMovements")} />
      )}

      {!query.isLoading && rows.length > 0 && (
        <>
          <PosRecordCardList>
            {rows.map((row) => (
              <PosRecordCard
                key={row.id}
                title={row.product?.name ?? row.productName ?? "-"}
                subtitle={row.product?.code ?? row.productCode ?? undefined}
                trailing={
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      MOVEMENT_TYPE_STYLES[row.type] ??
                      "bg-muted text-muted-foreground"
                    }`}
                  >
                    {row.type}
                  </span>
                }
                fields={[
                  {
                    label: t("pos.stock.purchaseDate"),
                    value: formatDate(row.purchaseDate),
                  },
                  { label: t("pos.stock.qty"), value: row.quantity },
                  {
                    label: t("pos.stock.buyPrice"),
                    value: row.buyPrice == null ? null : formatMoney(row.buyPrice),
                  },
                  { label: t("pos.stock.by"), value: row.createdBy?.username ?? null },
                  { label: t("pos.members.note"), value: row.note || null },
                ]}
              />
            ))}
          </PosRecordCardList>

          <PosDataTable className="hidden md:block">
            <PosTable>
              <PosTableHead>
                <tr>
                  <PosTableHeaderCell>{t("pos.stock.purchaseDate")}</PosTableHeaderCell>
                  <PosTableHeaderCell>{t("pos.stock.product")}</PosTableHeaderCell>
                  <PosTableHeaderCell>{t("pos.stock.movementType")}</PosTableHeaderCell>
                  <PosTableHeaderCell>{t("pos.stock.qty")}</PosTableHeaderCell>
                  <PosTableHeaderCell>{t("pos.stock.buyPrice")}</PosTableHeaderCell>
                  <PosTableHeaderCell>{t("pos.members.note")}</PosTableHeaderCell>
                  <PosTableHeaderCell>{t("pos.stock.by")}</PosTableHeaderCell>
                </tr>
              </PosTableHead>
              <PosTableBody>
                {rows.map((row) => (
                  <PosTableRow key={row.id}>
                    <PosTableCell>{formatDate(row.purchaseDate)}</PosTableCell>
                    <PosTableCell className="font-medium">
                      <span className="block">
                        {row.product?.name ?? row.productName ?? "-"}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {row.product?.code ?? row.productCode ?? ""}
                      </span>
                    </PosTableCell>
                    <PosTableCell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          MOVEMENT_TYPE_STYLES[row.type] ??
                          "bg-muted text-muted-foreground"
                        }`}
                      >
                        {row.type}
                      </span>
                    </PosTableCell>
                    <PosTableCell>{row.quantity}</PosTableCell>
                    <PosTableCell>
                      {row.buyPrice == null ? "-" : formatMoney(row.buyPrice)}
                    </PosTableCell>
                    <PosTableCell className="max-w-[16rem] truncate">
                      {row.note || "-"}
                    </PosTableCell>
                    <PosTableCell>{row.createdBy?.username ?? "-"}</PosTableCell>
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
        total={query.data?.meta.total}
        limit={limit}
        pageSizeOptions={PAGE_SIZE_OPTIONS.stock}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
      />

      {restockOpen && <RestockModal onClose={() => setRestockOpen(false)} />}
    </PosPageShell>
  );
}
