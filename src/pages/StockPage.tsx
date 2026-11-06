import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FolderTree, PackagePlus, Pencil, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { RestockModal } from "@/components/shared/pos/RestockModal";
import { StockStatusBadge } from "@/components/shared/pos/StockStatusBadge";
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
import { PosToaster, usePosToast } from "@/components/shared/pos/PosToast";
import { PosToolbar } from "@/components/shared/pos/PosToolbar";
import { TableSkeleton } from "@/components/shared/pos/TableSkeleton";
import { useAppliedSearch } from "@/hooks/useAppliedSearch";
import { useBranch } from "@/hooks/useBranch";
import {
  useUrlEnumParam,
  useUrlLimit,
  useUrlPage,
  useUrlQueryUpdater,
  useUrlStringParam,
} from "@/hooks/useUrlQuery";
import { useCategories, useProducts } from "@/hooks/useAdmin";
import { resetUrlPage, writeUrlString } from "@/lib/urlQuery";
import { useInventoryBalance } from "@/hooks/useStock";
import { formatMoney } from "@/lib/format";
import {
  getStockStatusFromQty,
  STOCK_STATUS_FILTERS,
  stockStatusToApi,
  type StockStatusFilter,
} from "@/lib/listFilters";
import { PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/queryConfig";
import type { Product } from "@/types/api";
import { cn } from "@/lib/utils";

export function StockPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canRestock, canWriteCatalog, currentBranch } = useBranch();
  const { toasts, showToast, dismiss } = usePosToast();
  const {
    searchInput,
    setSearchInput,
    appliedSearch,
    submitSearch,
    resetSearch,
  } = useAppliedSearch();
  const [page, setPage] = useUrlPage();
  const [limit, setLimit] = useUrlLimit(
    PAGE_SIZE.products,
    PAGE_SIZE_OPTIONS.products,
  );
  const [stockFilter, setStockFilter] = useUrlEnumParam<StockStatusFilter>(
    "stock",
    "ALL",
    STOCK_STATUS_FILTERS,
  );
  const updateUrl = useUrlQueryUpdater();
  const [topCategoryId] = useUrlStringParam("top");
  const [subCategoryId, setSubCategoryId] = useUrlStringParam("sub");
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockOpen, setRestockOpen] = useState(false);

  const topCategoriesQuery = useCategories("TOP");
  const subCategoriesQuery = useCategories("SUB");

  const topCategoryOptions = useMemo(
    () => topCategoriesQuery.data?.items ?? [],
    [topCategoriesQuery.data?.items],
  );

  const subCategoryOptions = useMemo(() => {
    const items = subCategoriesQuery.data?.items ?? [];
    if (!topCategoryId) return [];
    return items.filter((category) => category.parentId === topCategoryId);
  }, [subCategoriesQuery.data?.items, topCategoryId]);

  useEffect(() => {
    if (!topCategoryId && subCategoryId) {
      setSubCategoryId("", { resetPage: false });
      return;
    }
    if (
      subCategoryId &&
      !subCategoryOptions.some((category) => category.id === subCategoryId)
    ) {
      setSubCategoryId("", { resetPage: false });
    }
  }, [topCategoryId, subCategoryId, subCategoryOptions, setSubCategoryId]);

  const productQueryParams = useMemo(
    () => ({
      search: appliedSearch || undefined,
      topCategoryId: topCategoryId || undefined,
      subCategoryId: subCategoryId || undefined,
      stockStatus: stockStatusToApi(stockFilter),
      page,
      limit,
      isActive: true as const,
    }),
    [appliedSearch, topCategoryId, subCategoryId, stockFilter, page, limit],
  );

  const summaryQuery = useInventoryBalance({
    page: 1,
    limit: 1,
    sortBy: "name",
    sortOrder: "asc",
  });
  const summary = summaryQuery.data?.summary;

  const query = useProducts(productQueryParams);
  const rows = query.data?.items ?? [];
  const totalPages = query.data?.meta.totalPages ?? 1;

  const branchLabel = currentBranch
    ? `${currentBranch.name} (${currentBranch.code})`
    : null;

  const hasActiveFilters = Boolean(
    searchInput ||
      appliedSearch ||
      topCategoryId ||
      subCategoryId ||
      stockFilter !== "ALL",
  );

  function resetFilters() {
    setSearchInput("");
    updateUrl((params) => {
      params.delete("q");
      params.delete("top");
      params.delete("sub");
      params.delete("stock");
      resetUrlPage(params);
    });
  }

  function openProduct(productId: string) {
    navigate(`/stock/${productId}`);
  }

  function renderAvailability(row: Product) {
    return (
      <span
        className={cn(
          "rounded-full px-2 py-1 text-xs font-semibold",
          row.availability === "AVAILABLE"
            ? "bg-success text-success-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {row.availability}
      </span>
    );
  }

  function renderRowActions(row: Product) {
    if (!canRestock && !canWriteCatalog) return null;
    return (
      <>
        {canRestock && (
          <Button
            size="sm"
            variant="outline"
            onClick={(event) => {
              event.stopPropagation();
              setRestockProduct(row);
            }}
          >
            <PackagePlus className="size-3.5" />
            {t("pos.stock.restock")}
          </Button>
        )}
        {canWriteCatalog && (
          <Button
            size="sm"
            variant="outline"
            onClick={(event) => {
              event.stopPropagation();
              openProduct(row.id);
            }}
          >
            <Pencil className="size-3.5" />
            {t("pos.common.edit")}
          </Button>
        )}
      </>
    );
  }

  return (
    <>
      <PosPageShell>
        <PageHeader
          title={t("pos.modules.stockList")}
          description={
            branchLabel
              ? `${t("pos.stock.catalogDescription")} ${t("pos.stock.viewingBranch", { branch: branchLabel })}`
              : t("pos.stock.catalogDescription")
          }
          action={
            (canWriteCatalog || canRestock) ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/categories")}
                >
                  <FolderTree className="size-4" />
                  {t("pos.categories.title")}
                </Button>
                {canWriteCatalog && (
                  <Button onClick={() => navigate("/products/create")}>
                    <Plus className="size-4" />
                    {t("pos.settings.addProduct")}
                  </Button>
                )}
                {canRestock && (
                  <Button onClick={() => setRestockOpen(true)}>
                    <PackagePlus className="size-4" />
                    {t("pos.stock.addMovement")}
                  </Button>
                )}
              </div>
            ) : undefined
          }
        />

        {summary && (
          <PosSummaryCards className="mb-6">
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

        <div className="space-y-4">
          <PosToolbar className="p-3 sm:p-3 lg:items-center">
            <div className="flex w-full min-w-0 flex-wrap items-center gap-2 lg:flex-nowrap">
              <PosSearchBar
                value={searchInput}
                onChange={setSearchInput}
                onSubmit={submitSearch}
                onClear={resetSearch}
                placeholder={t("pos.products.searchPlaceholder")}
                className="min-w-0 w-full max-w-none flex-1 basis-[14rem] [&_button]:h-9 [&_input]:h-9"
              />
              <Select
                id="stock-top-category"
                size="sm"
                aria-label={t("pos.settings.topCategory")}
                value={topCategoryId}
                className="h-9 min-h-9 w-[11.5rem] shrink-0 text-sm"
                onChange={(event) => {
                  updateUrl((params) => {
                    writeUrlString(params, "top", event.target.value);
                    params.delete("sub");
                    resetUrlPage(params);
                  });
                }}
              >
                <option value="">{t("pos.sale.allCategories")}</option>
                {topCategoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <Select
                id="stock-sub-category"
                size="sm"
                aria-label={t("pos.settings.subCategory")}
                value={topCategoryId ? subCategoryId : ""}
                className="h-9 min-h-9 w-[13rem] shrink-0 text-sm"
                disabled={!topCategoryId}
                onChange={(event) => setSubCategoryId(event.target.value)}
              >
                <option value="">
                  {topCategoryId
                    ? t("pos.sale.allSubCategories")
                    : t("pos.stock.selectTopCategoryFirst")}
                </option>
                {subCategoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <PosFilterSelect
                value={stockFilter}
                options={STOCK_STATUS_FILTERS}
                onChange={setStockFilter}
                ariaLabel={t("pos.stock.status")}
                getLabel={(value) => t(`pos.filters.stock.${value}`)}
                className="h-9 min-h-9 w-[9.5rem] sm:w-[9.5rem] shrink-0"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0 gap-1.5 px-3"
                disabled={!hasActiveFilters}
                onClick={resetFilters}
                title={t("pos.common.reset")}
              >
                <RotateCcw className="size-3.5" />
                {t("pos.common.reset")}
              </Button>
            </div>
          </PosToolbar>

          {query.isLoading && !query.data && <TableSkeleton />}
          {query.isError && <ErrorState />}
          {!query.isLoading && rows.length === 0 && (
            <EmptyState message={t("pos.products.empty")} />
          )}

          {!query.isLoading && rows.length > 0 && (
            <>
              <PosRecordCardList>
                {rows.map((row) => (
                  <PosRecordCard
                    key={row.id}
                    title={row.name}
                    subtitle={row.code}
                    onTitleClick={() => openProduct(row.id)}
                    trailing={
                      <>
                        <StockStatusBadge
                          status={getStockStatusFromQty(row.stockQty)}
                        />
                        {renderAvailability(row)}
                      </>
                    }
                    fields={[
                      { label: t("pos.stock.price"), value: formatMoney(row.sellingPrice) },
                      { label: t("pos.settings.discount"), value: formatMoney(row.discount) },
                      { label: t("pos.sale.stock"), value: row.stockQty },
                      {
                        label: t("pos.settings.barcode"),
                        value: row.barcode ?? null,
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
                      <PosTableHeaderCell>
                        {t("pos.settings.productName")}
                      </PosTableHeaderCell>
                      <PosTableHeaderCell>{t("pos.stock.code")}</PosTableHeaderCell>
                      <PosTableHeaderCell>
                        {t("pos.settings.barcode")}
                      </PosTableHeaderCell>
                      <PosTableHeaderCell>{t("pos.stock.price")}</PosTableHeaderCell>
                      <PosTableHeaderCell>
                        {t("pos.settings.discount")}
                      </PosTableHeaderCell>
                      <PosTableHeaderCell>{t("pos.sale.stock")}</PosTableHeaderCell>
                      <PosTableHeaderCell>{t("pos.stock.status")}</PosTableHeaderCell>
                      <PosTableHeaderCell>
                        {t("pos.products.availability")}
                      </PosTableHeaderCell>
                      <PosTableHeaderCell />
                    </tr>
                  </PosTableHead>
                  <PosTableBody>
                    {rows.map((row) => (
                      <PosTableRow
                        key={row.id}
                        onClick={() => openProduct(row.id)}
                      >
                        <PosTableCell className="font-medium">
                          {row.name}
                        </PosTableCell>
                        <PosTableCell>{row.code}</PosTableCell>
                        <PosTableCell>{row.barcode ?? "-"}</PosTableCell>
                        <PosTableCell>{formatMoney(row.sellingPrice)}</PosTableCell>
                        <PosTableCell>{formatMoney(row.discount)}</PosTableCell>
                        <PosTableCell>{row.stockQty}</PosTableCell>
                        <PosTableCell>
                          <StockStatusBadge
                            status={getStockStatusFromQty(row.stockQty)}
                          />
                        </PosTableCell>
                        <PosTableCell>{renderAvailability(row)}</PosTableCell>
                        <PosTableCell>
                          <div
                            className="flex justify-end gap-2"
                            onClick={(event) => event.stopPropagation()}
                          >
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
            total={query.data?.meta.total}
            limit={limit}
            pageSizeOptions={PAGE_SIZE_OPTIONS.products}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
          />
        </div>
      </PosPageShell>

      {canRestock && restockProduct && (
        <RestockModal
          initialProduct={{
            productId: restockProduct.id,
            name: restockProduct.name,
            code: restockProduct.code,
          }}
          onClose={() => setRestockProduct(null)}
          onSuccess={() =>
            showToast("success", t("pos.stock.restockSuccess"))
          }
        />
      )}

      {canRestock && restockOpen && (
        <RestockModal
          onClose={() => setRestockOpen(false)}
          onSuccess={() => showToast("success", t("pos.stock.restockSuccess"))}
        />
      )}

      <PosToaster toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
