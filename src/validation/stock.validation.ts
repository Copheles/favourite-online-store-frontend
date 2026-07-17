import { z } from "zod";
import { stockMovementTypeSchema } from "@/validation/common.validation";
import { optionalString } from "@/validation/common.validation";

export const getStockMovementSchema = (t: (key: string) => string) =>
  z.object({
    productId: z.string().min(1, t("pos.validation.productRequired")),
    branchId: z.string().min(1, t("pos.validation.branchRequired")),
    type: stockMovementTypeSchema,
    quantity: z.number().min(1, t("pos.validation.quantityMin")),
    buyPrice: z.number().min(0, t("pos.validation.minZero")).nullable().optional(),
    purchaseDate: z.string().min(1, t("pos.validation.dateRequired")),
    note: optionalString(255),
  });

export type StockMovementFormValues = z.infer<
  ReturnType<typeof getStockMovementSchema>
>;
