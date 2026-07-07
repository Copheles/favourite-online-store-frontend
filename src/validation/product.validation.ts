import { z } from "zod";
import { optionalString } from "@/validation/common.validation";
import type { Product } from "@/types/api";

export const getProductEditSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t("pos.validation.nameRequired"))
      .max(128, t("pos.validation.max128")),
    code: z
      .string()
      .min(1, t("pos.validation.codeRequired"))
      .max(64, t("pos.validation.max64")),
    barcode: optionalString(255),
    sellingPrice: z.number().min(0, t("pos.validation.minZero")),
    discount: z.number().min(0, t("pos.validation.minZero")),
    topCategoryId: z.string().min(1, t("pos.validation.categoryRequired")),
    subCategoryId: z.string().min(1, t("pos.validation.categoryRequired")),
    unit: optionalString(255),
    description: optionalString(1000),
    type: z.enum(["STOCK_CONTROL", "NO_STOCK_CONTROL"]),
    availability: z.enum(["AVAILABLE", "UNAVAILABLE"]),
    saleOrder: z.number().int().min(0, t("pos.validation.minZero")),
    isActive: z.boolean(),
  });

export type ProductEditFormValues = z.infer<
  ReturnType<typeof getProductEditSchema>
>;

export const productEditDefaults: ProductEditFormValues = {
  name: "",
  code: "",
  barcode: "",
  sellingPrice: 0,
  discount: 0,
  topCategoryId: "",
  subCategoryId: "",
  unit: "",
  description: "",
  type: "STOCK_CONTROL",
  availability: "AVAILABLE",
  saleOrder: 0,
  isActive: true,
};

export function productToEditValues(product: Product): ProductEditFormValues {
  return {
    name: product.name,
    code: product.code,
    barcode: product.barcode ?? "",
    sellingPrice: product.sellingPrice,
    discount: product.discount,
    topCategoryId: product.topCategoryId,
    subCategoryId: product.subCategoryId,
    unit: product.unit ?? "",
    description: product.description ?? "",
    type: product.type,
    availability: product.availability,
    saleOrder: product.saleOrder,
    isActive: product.isActive,
  };
}

export function productEditValuesToInput(values: ProductEditFormValues) {
  return {
    name: values.name,
    code: values.code,
    barcode: values.barcode?.trim() || null,
    sellingPrice: values.sellingPrice,
    discount: values.discount || 0,
    topCategoryId: values.topCategoryId,
    subCategoryId: values.subCategoryId,
    unit: values.unit?.trim() || null,
    description: values.description?.trim() || null,
    type: values.type,
    availability: values.availability,
    saleOrder: values.saleOrder,
    isActive: values.isActive,
  };
}
