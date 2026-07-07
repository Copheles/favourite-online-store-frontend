import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { ApiErrorAlert } from "@/components/forms/ApiErrorAlert";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextField } from "@/components/forms/FormTextField";
import { CategoryQuickCreate } from "@/components/forms/ProductCreateForm";
import { ErrorState, LoadingState } from "@/components/shared/PageStates";
import { useCategories, useUpdateProduct } from "@/hooks/useAdmin";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/types/api";
import {
  getProductEditSchema,
  productEditValuesToInput,
  productToEditValues,
  type ProductEditFormValues,
} from "@/validation/product.validation";

const TYPE_OPTIONS = [
  { value: "STOCK_CONTROL", label: "STOCK_CONTROL" },
  { value: "NO_STOCK_CONTROL", label: "NO_STOCK_CONTROL" },
];

const AVAILABILITY_OPTIONS = [
  { value: "AVAILABLE", label: "AVAILABLE" },
  { value: "UNAVAILABLE", label: "UNAVAILABLE" },
];

export function ProductEditForm({
  product,
  onSuccess,
  onCancel,
}: {
  product: Product;
  onSuccess?: (product: Product) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const updateMutation = useUpdateProduct();
  const topCategories = useCategories("TOP");
  const subCategories = useCategories("SUB");

  const schema = useMemo(() => getProductEditSchema(t), [t]);
  const form = useForm<ProductEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: productToEditValues(product),
  });

  const topCategoryId = form.watch("topCategoryId");

  useEffect(() => {
    form.reset(productToEditValues(product));
  }, [product, form]);

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

  const categoriesLoading = topCategories.isLoading || subCategories.isLoading;
  const categoriesError = topCategories.error || subCategories.error;

  function handleSubmit(values: ProductEditFormValues) {
    updateMutation.mutate(
      { id: product.id, input: productEditValuesToInput(values) },
      {
        onSuccess: (updated) => {
          onSuccess?.(updated);
        },
      },
    );
  }

  function handleDeactivate() {
    if (!window.confirm(t("pos.products.deactivateConfirm"))) return;
    updateMutation.mutate(
      { id: product.id, input: { isActive: false } },
      {
        onSuccess: (updated) => {
          onSuccess?.(updated);
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
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

        <div className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">
          <p className="font-medium text-foreground">
            {t("pos.sale.stock")}: {product.stockQty}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("pos.products.stockReadOnlyHint")}{" "}
            <Link to="/stock" className="font-semibold text-primary underline">
              {t("pos.modules.stock")}
            </Link>
          </p>
        </div>

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
          <FormTextField
            control={form.control}
            name="unit"
            label={t("pos.products.unit")}
          />
        </div>

        <FormTextField
          control={form.control}
          name="description"
          label={t("pos.products.descriptionField")}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <FormSelect
            control={form.control}
            name="topCategoryId"
            label={t("pos.settings.topCategory")}
            options={topOptions}
            placeholder={t("pos.settings.selectCategory")}
          />
          <FormSelect
            control={form.control}
            name="subCategoryId"
            label={t("pos.settings.subCategory")}
            options={subOptions}
            placeholder={t("pos.settings.selectCategory")}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <FormSelect
            control={form.control}
            name="type"
            label={t("pos.products.type")}
            options={TYPE_OPTIONS}
          />
          <FormSelect
            control={form.control}
            name="availability"
            label={t("pos.products.availability")}
            options={AVAILABILITY_OPTIONS}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <FormTextField
            control={form.control}
            name="saleOrder"
            label={t("pos.products.saleOrder")}
            type="number"
            min={0}
          />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-muted-foreground">
                  {t("pos.products.isActive")}
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value ? "true" : "false"}
                    onChange={(e) =>
                      field.onChange(e.target.value === "true")
                    }
                  >
                    <option value="true">{t("pos.products.active")}</option>
                    <option value="false">{t("pos.products.inactive")}</option>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          {t("pos.products.finalPricePreview", {
            price: formatMoney(
              Math.max(
                form.watch("sellingPrice") - (form.watch("discount") || 0),
                0,
              ),
            ),
          })}
        </p>

        <ApiErrorAlert error={updateMutation.error} />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          {product.isActive && (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              disabled={updateMutation.isPending}
              onClick={handleDeactivate}
            >
              {t("pos.products.deactivate")}
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("pos.common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={
                updateMutation.isPending ||
                categoriesLoading ||
                topOptions.length === 0 ||
                subOptions.length === 0
              }
            >
              {updateMutation.isPending
                ? t("pos.common.loading")
                : t("pos.common.save")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
