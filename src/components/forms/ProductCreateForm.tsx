import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Form } from "@/components/ui/form";
import { ApiErrorAlert } from "@/components/forms/ApiErrorAlert";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextField } from "@/components/forms/FormTextField";
import { ErrorState, LoadingState } from "@/components/shared/PageStates";
import {
  useCategories,
  useCreateCategory,
  useCreateProductWithStock,
  useProducts,
} from "@/hooks/useAdmin";
import { formatMoney } from "@/lib/format";
import {
  getProductSchema,
  productFormDefaults,
  type ProductFormValues,
} from "@/validation/settings.validation";

interface ProductCreateFormProps {
  compact?: boolean;
  hideHeader?: boolean;
  onSuccess?: (productName: string) => void;
}

export function CategoryQuickCreate({
  onCreated,
}: {
  onCreated: (categoryId: string, type: "TOP" | "SUB") => void;
}) {
  const { t } = useTranslation();
  const createCategory = useCreateCategory();
  const topCategories = useCategories("TOP");
  const [topName, setTopName] = useState("");
  const [subName, setSubName] = useState("");
  const [parentTopId, setParentTopId] = useState("");

  const topOptions =
    topCategories.data?.items.map((c) => ({ value: c.id, label: c.name })) ??
    [];

  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-3">
      <p className="text-sm font-semibold text-foreground">
        {t("pos.settings.quickCategories")}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("pos.settings.quickCategoriesHint")}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">
            {t("pos.settings.newTopCategory")}
          </label>
          <div className="flex gap-2">
            <Input
              value={topName}
              onChange={(e) => setTopName(e.target.value)}
              placeholder={t("pos.settings.categoryName")}
            />
            <Button
              type="button"
              variant="outline"
              className="h-10 shrink-0"
              disabled={!topName.trim() || createCategory.isPending}
              onClick={() =>
                createCategory.mutate(
                  { name: topName.trim(), type: "TOP", parentId: null },
                  {
                    onSuccess: (cat) => {
                      setTopName("");
                      onCreated(cat.id, "TOP");
                    },
                  },
                )
              }
            >
              {t("pos.common.add")}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">
            {t("pos.settings.newSubCategory")}
          </label>
          <Select
            value={parentTopId}
            onChange={(e) => setParentTopId(e.target.value)}
          >
            <option value="">{t("pos.settings.selectCategory")}</option>
            {topOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <div className="flex gap-2">
            <Input
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              placeholder={t("pos.settings.categoryName")}
            />
            <Button
              type="button"
              variant="outline"
              className="h-10 shrink-0"
              disabled={
                !subName.trim() ||
                !parentTopId ||
                createCategory.isPending
              }
              onClick={() =>
                createCategory.mutate(
                  {
                    name: subName.trim(),
                    type: "SUB",
                    parentId: parentTopId,
                  },
                  {
                    onSuccess: (cat) => {
                      setSubName("");
                      onCreated(cat.id, "SUB");
                    },
                  },
                )
              }
            >
              {t("pos.common.add")}
            </Button>
          </div>
        </div>
      </div>

      <ApiErrorAlert error={createCategory.error} />
    </div>
  );
}

export function ProductCreateForm({
  compact,
  hideHeader,
  onSuccess,
}: ProductCreateFormProps) {
  const { t } = useTranslation();
  const createMutation = useCreateProductWithStock();
  const topCategories = useCategories("TOP");
  const subCategories = useCategories("SUB");
  const productsQuery = useProducts({ page: 1, limit: 10 });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const schema = useMemo(() => getProductSchema(t), [t]);
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: productFormDefaults,
  });

  const topCategoryId = form.watch("topCategoryId");

  const topOptions =
    topCategories.data?.items.map((c) => ({ value: c.id, label: c.name })) ??
    [];

  const subOptions = useMemo(() => {
    const items = subCategories.data?.items ?? [];
    const filtered = topCategoryId
      ? items.filter((c) => c.parentId === topCategoryId)
      : items;
    return filtered.map((c) => ({ value: c.id, label: c.name }));
  }, [subCategories.data?.items, topCategoryId]);

  useEffect(() => {
    const currentSub = form.getValues("subCategoryId");
    if (currentSub && !subOptions.some((o) => o.value === currentSub)) {
      form.setValue("subCategoryId", "");
    }
  }, [topCategoryId, subOptions, form]);

  function handleSubmit(values: ProductFormValues) {
    setSuccessMessage(null);
    createMutation.mutate(values, {
      onSuccess: (product) => {
        const msg =
          values.initialStockQty > 0
            ? t("pos.settings.productCreatedWithStock", {
                name: product.name,
                qty: values.initialStockQty,
              })
            : t("pos.settings.productCreated", { name: product.name });
        setSuccessMessage(msg);
        form.reset(productFormDefaults);
        onSuccess?.(product.name);
      },
    });
  }

  const categoriesLoading = topCategories.isLoading || subCategories.isLoading;
  const categoriesError = topCategories.error || subCategories.error;
  const noCategories = !categoriesLoading && topOptions.length === 0;

  return (
    <div className={compact ? "space-y-4" : "grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]"}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-3 rounded-xl border border-border/70 bg-card p-5"
        >
          {!hideHeader && (
            <div>
              <h3 className="font-bold text-foreground">
                {t("pos.settings.addProduct")}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("pos.settings.productCreateHint")}
              </p>
            </div>
          )}

          {categoriesLoading && (
            <LoadingState label={t("pos.common.loading")} />
          )}

          {categoriesError && (
            <ErrorState message={t("pos.settings.categoriesLoadError")} />
          )}

          {!categoriesLoading && (
            <CategoryQuickCreate
              onCreated={(categoryId, type) => {
                if (type === "TOP") {
                  form.setValue("topCategoryId", categoryId);
                } else {
                  form.setValue("subCategoryId", categoryId);
                }
              }}
            />
          )}

          {noCategories && (
            <p className="rounded-lg bg-warning px-3 py-2 text-sm text-warning-foreground">
              {t("pos.settings.noCategories")}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <FormTextField
              control={form.control}
              name="name"
              label={t("pos.settings.productName")}
            />
            <FormTextField
              control={form.control}
              name="code"
              label={t("pos.stock.code")}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormTextField
              control={form.control}
              name="barcode"
              label={t("pos.settings.barcode")}
            />
            <FormTextField
              control={form.control}
              name="sellingPrice"
              label={t("pos.stock.price")}
              type="number"
              min={0}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormTextField
              control={form.control}
              name="discount"
              label={t("pos.settings.discount")}
              type="number"
              min={0}
            />
            <FormSelect
              control={form.control}
              name="topCategoryId"
              label={t("pos.settings.topCategory")}
              options={topOptions}
              placeholder={t("pos.settings.selectCategory")}
            />
          </div>

          <FormSelect
            control={form.control}
            name="subCategoryId"
            label={t("pos.settings.subCategory")}
            options={subOptions}
            placeholder={t("pos.settings.selectCategory")}
          />

          <div className="rounded-lg border border-border bg-muted p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("pos.settings.initialStock")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("pos.settings.initialStockHint")}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <FormTextField
                control={form.control}
                name="initialStockQty"
                label={t("pos.stock.qty")}
                type="number"
                min={0}
              />
              <FormTextField
                control={form.control}
                name="buyPrice"
                label={t("pos.stock.buyPrice")}
                type="number"
                min={0}
              />
            </div>
          </div>

          {successMessage && (
            <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success-foreground">
              {successMessage}{" "}
              <Link to="/sale" className="font-semibold underline">
                {t("pos.settings.goToSale")}
              </Link>
            </p>
          )}

          <ApiErrorAlert error={createMutation.error} />

          <Button
            type="submit"
            disabled={
              createMutation.isPending ||
              categoriesLoading ||
              topOptions.length === 0 ||
              subOptions.length === 0
            }
          >
            {createMutation.isPending
              ? t("pos.common.loading")
              : t("pos.settings.addProduct")}
          </Button>
        </form>
      </Form>

      {!compact && (
        <aside className="rounded-xl border border-border/70 bg-card p-5 lg:sticky lg:top-4 lg:self-start">
          <h3 className="text-sm font-semibold text-foreground">
            {t("pos.settings.recentProducts")}
          </h3>
          {productsQuery.isLoading && (
            <div className="mt-3">
              <LoadingState label={t("pos.common.loading")} />
            </div>
          )}
          {!productsQuery.isLoading &&
            (productsQuery.data?.items.length ?? 0) === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                {t("pos.products.empty")}
              </p>
            )}
          <div className="mt-3 space-y-2">
            {productsQuery.data?.items.map((product) => (
              <div
                key={product.id}
                className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 font-medium leading-snug">
                    {product.name}
                  </p>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {formatMoney(product.sellingPrice)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {product.code}
                  {" · "}
                  {t("pos.sale.stock")}: {product.stockQty}
                </p>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
