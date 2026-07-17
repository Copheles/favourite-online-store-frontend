import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCreateForm } from "@/components/forms/ProductCreateForm";
import { PageHeader } from "@/components/shared/PageStates";
import { PosPageShell } from "@/components/shared/pos/PosPageShell";
import { PosToaster, usePosToast } from "@/components/shared/pos/PosToast";
import { useBranch } from "@/hooks/useBranch";

export function ProductCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canWriteCatalog } = useBranch();
  const { toasts, showToast, dismiss } = usePosToast();

  if (!canWriteCatalog) {
    return <Navigate to="/products" replace />;
  }

  return (
    <>
      <PosPageShell>
        <PageHeader
          title={t("pos.settings.addProduct")}
          description={t("pos.settings.productCreateHint")}
          action={
            <Button variant="outline" onClick={() => navigate("/products")}>
              {t("pos.common.cancel")}
            </Button>
          }
        />

        <ProductCreateForm
          hideHeader
          onSuccess={(name) =>
            showToast("success", t("pos.settings.productCreated", { name }))
          }
        />
      </PosPageShell>

      <PosToaster toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
