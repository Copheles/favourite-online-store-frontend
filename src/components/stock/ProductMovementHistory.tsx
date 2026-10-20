import { useTranslation } from "react-i18next";
import {
  EmptyState,
  ErrorState,
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
import {
  PosRecordCard,
  PosRecordCardList,
} from "@/components/shared/pos/PosRecordCard";
import { PosFilterSelect } from "@/components/shared/pos/PosFilterSelect";
import { PosPagination } from "@/components/shared/pos/PosPagination";
import { TableSkeleton } from "@/components/shared/pos/TableSkeleton";
import { useStockMovements } from "@/hooks/useStock";
import { useUrlEnumParam, useUrlLimit, useUrlPage } from "@/hooks/useUrlQuery";
import { formatDate, formatMoney } from "@/lib/format";
import { PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/queryConfig";
import type { StockMovement, StockMovementType } from "@/apis/stockMovement.api";
import { cn } from "@/lib/utils";

const MOVEMENT_TYPE_FILTERS = ["ALL", "IN", "OUT", "OUT_RETURN"] as const;
export type MovementTypeFilter = (typeof MOVEMENT_TYPE_FILTERS)[number];

function movementQtyLabel(type: StockMovementType, quantity: number): string {
  if (type === "IN" || type === "OUT_RETURN") {
    return `+${quantity}`;
  }
  if (type === "OUT") {
    return `−${quantity}`;
  }
  return String(quantity);
}

function movementTypeLabel(
  t: (key: string) => string,
  type: StockMovementType,
): string {
  const key = `pos.stock.movementTypes.${type}`;
  const translated = t(key);
  return translated === key ? type : translated;
}

interface ProductMovementHistoryProps {
  productId: string;
}

export function ProductMovementHistory({ productId }: ProductMovementHistoryProps) {
  const { t } = useTranslation();
  const [page, setPage] = useUrlPage();
  const [limit, setLimit] = useUrlLimit(PAGE_SIZE.stock, PAGE_SIZE_OPTIONS.stock);
  const [typeFilter, setTypeFilter] = useUrlEnumParam<MovementTypeFilter>(
    "type",
    "ALL",
    MOVEMENT_TYPE_FILTERS,
  );

  const query = useStockMovements({
    productId,
    type: typeFilter,
    page,
    limit,
  });

  const rows = query.data?.items ?? [];
  const totalPages = query.data?.meta.totalPages ?? 1;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-foreground">
          {t("pos.stock.movementHistory")}
        </h2>
        <PosFilterSelect
          value={typeFilter}
          options={MOVEMENT_TYPE_FILTERS}
          onChange={setTypeFilter}
          ariaLabel={t("pos.stock.movementType")}
          getLabel={(value) => t(`pos.filters.movement.${value}`)}
          className="sm:w-52"
        />
      </div>

      {query.isLoading && !query.data && <TableSkeleton rows={6} cols={6} />}
      {query.isError && <ErrorState />}
      {!query.isLoading && rows.length === 0 && (
        <EmptyState message={t("pos.stock.noProductMovements")} />
      )}

      {!query.isLoading && rows.length > 0 && (
        <>
          <PosRecordCardList>
            {rows.map((row) => (
              <MovementCard key={row.id} row={row} t={t} />
            ))}
          </PosRecordCardList>

          <PosDataTable className="hidden md:block">
            <PosTable>
              <PosTableHead>
                <tr>
                  <PosTableHeaderCell>{t("pos.stock.purchaseDate")}</PosTableHeaderCell>
                  <PosTableHeaderCell>{t("pos.stock.movementType")}</PosTableHeaderCell>
                  <PosTableHeaderCell>{t("pos.stock.qty")}</PosTableHeaderCell>
                  <PosTableHeaderCell>{t("pos.stock.buyPrice")}</PosTableHeaderCell>
                  <PosTableHeaderCell>{t("pos.members.note")}</PosTableHeaderCell>
                  <PosTableHeaderCell>{t("pos.stock.by")}</PosTableHeaderCell>
                </tr>
              </PosTableHead>
              <PosTableBody>
                {rows.map((row) => (
                  <MovementTableRow key={row.id} row={row} t={t} />
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
    </section>
  );
}

function MovementCard({
  row,
  t,
}: {
  row: StockMovement;
  t: (key: string) => string;
}) {
  return (
    <PosRecordCard
      title={movementTypeLabel(t, row.type)}
      subtitle={formatDate(row.purchaseDate)}
      trailing={
        <span
          className={cn(
            "text-sm font-semibold",
            row.type === "OUT"
              ? "text-destructive"
              : "text-emerald-600 dark:text-emerald-400",
          )}
        >
          {movementQtyLabel(row.type, row.quantity)}
        </span>
      }
      fields={[
        {
          label: t("pos.stock.buyPrice"),
          value: row.buyPrice == null ? null : formatMoney(row.buyPrice),
        },
        { label: t("pos.stock.by"), value: row.createdBy?.username ?? null },
        { label: t("pos.members.note"), value: row.note || null },
      ]}
    />
  );
}

function MovementTableRow({
  row,
  t,
}: {
  row: StockMovement;
  t: (key: string) => string;
}) {
  return (
    <PosTableRow>
      <PosTableCell>{formatDate(row.purchaseDate)}</PosTableCell>
      <PosTableCell>{movementTypeLabel(t, row.type)}</PosTableCell>
      <PosTableCell
        className={cn(
          "font-medium",
          row.type === "OUT"
            ? "text-destructive"
            : "text-emerald-600 dark:text-emerald-400",
        )}
      >
        {movementQtyLabel(row.type, row.quantity)}
      </PosTableCell>
      <PosTableCell>
        {row.buyPrice == null ? "-" : formatMoney(row.buyPrice)}
      </PosTableCell>
      <PosTableCell className="max-w-[16rem] truncate">
        {row.note || "-"}
      </PosTableCell>
      <PosTableCell>{row.createdBy?.username ?? "-"}</PosTableCell>
    </PosTableRow>
  );
}
