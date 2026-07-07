import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PackagePlus, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductEditForm } from "@/components/forms/ProductEditForm";
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
import { PosModal } from "@/components/shared/pos/PosModal";
import { PosPageShell } from "@/components/shared/pos/PosPageShell";
import {
  PosRecordCard,
  PosRecordCardList,
} from "@/components/shared/pos/PosRecordCard";
import { PosFilterSelect } from "@/components/shared/pos/PosFilterSelect";
import { PosPagination } from "@/components/shared/pos/PosPagination";
import { PosSearchBar } from "@/components/shared/pos/PosSearchBar";
import { PosToaster, usePosToast } from "@/components/shared/pos/PosToast";
import { PosToolbar } from "@/components/shared/pos/PosToolbar";
import { TableSkeleton } from "@/components/shared/pos/TableSkeleton";
import { useAppliedSearch } from "@/hooks/useAppliedSearch";
import { useUrlEnumParam, useUrlLimit, useUrlPage } from "@/hooks/useUrlQuery";
import { useProducts } from "@/hooks/useAdmin";
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

export function ProductsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);

  const productQueryParams = useMemo(
    () => ({
      search: appliedSearch || undefined,
      stockStatus: stockStatusToApi(stockFilter),
      page,
      limit,
      isActive: true as const,
    }),
    [appliedSearch, stockFilter, page, limit],
  );

  const query = useProducts(productQueryParams);

  const rows = query.data?.items ?? [];
  const totalPages = query.data?.meta.totalPages ?? 1;

  function openEdit(product: Product) {
    setEditingProduct(product);
  }

  function closeEdit() {
    setEditingProduct(null);
  }

  function handleEditSuccess(product: Product) {
    if (!product.isActive) {
      showToast("info", t("pos.products.deactivated"));
    } else {
      showToast("success", t("pos.products.updated", { name: product.name }));
    }
    closeEdit();
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
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setRestockProduct(row)}
        >
          <PackagePlus className="size-3.5" />
          {t("pos.stock.restock")}
        </Button>
        <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
          <Pencil className="size-3.5" />
          {t("pos.common.edit")}
        </Button>
      </>
    );
  }

  return (
    <>
      <PosPageShell>
        <PageHeader
          title={t("pos.modules.products")}
          description={t("pos.products.description")}
          action={
            <Button onClick={() => navigate("/products/create")}>
              <Plus className="size-4" />
              {t("pos.settings.addProduct")}
            </Button>
          }
        />

        <div className="space-y-4">
          <PosToolbar>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <PosSearchBar
                value={searchInput}
                onChange={setSearchInput}
                onSubmit={submitSearch}
                onClear={resetSearch}
                placeholder={t("pos.products.searchPlaceholder")}
                className="w-full sm:max-w-md sm:flex-1 lg:max-w-xl"
              />
              <PosFilterSelect
                value={stockFilter}
                options={STOCK_STATUS_FILTERS}
                onChange={setStockFilter}
                ariaLabel={t("pos.stock.status")}
                getLabel={(value) => t(`pos.filters.stock.${value}`)}
                className="sm:w-48"
              />
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
                      <PosTableRow key={row.id}>
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
                          <div className="flex justify-end gap-2">
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

      {editingProduct && (
        <PosModal
          wide
          title={t("pos.products.editTitle")}
          description={editingProduct.name}
          onClose={closeEdit}
          closeLabel={t("pos.common.close")}
        >
          <ProductEditForm
            product={editingProduct}
            onCancel={closeEdit}
            onSuccess={handleEditSuccess}
          />
        </PosModal>
      )}

      {restockProduct && (
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

      <PosToaster toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
