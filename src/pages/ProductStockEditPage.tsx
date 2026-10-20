import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductEditForm } from "@/components/forms/ProductEditForm";
import { ProductMovementHistory } from "@/components/stock/ProductMovementHistory";
import { RestockModal } from "@/components/shared/pos/RestockModal";
import { StockStatusBadge } from "@/components/shared/pos/StockStatusBadge";
import {
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/components/shared/PageStates";
import { PosPageShell } from "@/components/shared/pos/PosPageShell";
import { PosToaster, usePosToast } from "@/components/shared/pos/PosToast";
import { useBranch } from "@/hooks/useBranch";
import { useProduct } from "@/hooks/useAdmin";
import { formatMoney } from "@/lib/format";
import { getStockStatusFromQty } from "@/lib/listFilters";
import { useState } from "react";

export function ProductStockEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const { canRestock, canWriteCatalog } = useBranch();
  const { toasts, showToast, dismiss } = usePosToast();
  const [restockOpen, setRestockOpen] = useState(false);

  const query = useProduct(productId ?? null);
  const product = query.data;

  if (!productId) {
    return (
      <PosPageShell>
        <ErrorState />
      </PosPageShell>
    );
  }

  if (query.isLoading) {
    return (
      <PosPageShell>
        <LoadingState />
      </PosPageShell>
    );
  }

  if (query.isError || !product) {
    return (
      <PosPageShell>
        <ErrorState />
      </PosPageShell>
    );
  }

  function handleEditSuccess(updated: { name: string; isActive: boolean }) {
    if (!updated.isActive) {
      showToast("info", t("pos.products.deactivated"));
      navigate("/stock", { replace: true });
      return;
    }
    showToast("success", t("pos.products.updated", { name: updated.name }));
  }

  return (
    <>
      <PosPageShell>
        <PageHeader
          title={product.name}
          description={product.code}
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate("/stock")}>
                <ArrowLeft className="size-4" />
                {t("pos.stock.backToCatalog")}
              </Button>
              {canRestock && (
                <Button onClick={() => setRestockOpen(true)}>
                  <PackagePlus className="size-4" />
                  {t("pos.stock.addMovement")}
                </Button>
              )}
            </div>
          }
        />

        <div className="mb-8 grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              {t("pos.sale.stock")}
            </p>
            <p className="text-lg font-bold">{product.stockQty}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              {t("pos.stock.status")}
            </p>
            <StockStatusBadge status={getStockStatusFromQty(product.stockQty)} />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              {t("pos.stock.price")}
            </p>
            <p className="font-medium">{formatMoney(product.sellingPrice)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              {t("pos.settings.barcode")}
            </p>
            <p className="font-medium">{product.barcode ?? "—"}</p>
          </div>
        </div>

        {canWriteCatalog ? (
          <div className="mb-10 rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-bold">{t("pos.products.editTitle")}</h2>
            <ProductEditForm
              product={product}
              onCancel={() => navigate("/stock")}
              onSuccess={handleEditSuccess}
              onDeleted={() => {
                showToast("success", t("pos.products.deleted", { name: product.name }));
                navigate("/stock", { replace: true });
              }}
            />
          </div>
        ) : (
          <p className="mb-6 text-sm text-muted-foreground">
            {t("pos.products.stockReadOnlyHint")}{" "}
            <button
              type="button"
              className="font-semibold text-primary underline-offset-2 hover:underline"
              onClick={() => navigate("/stock")}
            >
              {t("pos.modules.stockList")}
            </button>
          </p>
        )}

        <ProductMovementHistory productId={productId} />
      </PosPageShell>

      {canRestock && restockOpen && (
        <RestockModal
          initialProduct={{
            productId: product.id,
            name: product.name,
            code: product.code,
          }}
          onClose={() => setRestockOpen(false)}
          onSuccess={() => showToast("success", t("pos.stock.restockSuccess"))}
        />
      )}

      <PosToaster toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
