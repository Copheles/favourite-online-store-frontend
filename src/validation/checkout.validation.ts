import { z } from "zod";
import { optionalString, paymentTypeSchema } from "@/validation/common.validation";

export const getCheckoutSchema = (t: (key: string) => string) =>
  z.object({
    customerId: z.string().optional().or(z.literal("")),
    status: z.enum(["COMPLETED", "PROCESSING"]),
    paymentType: paymentTypeSchema,
    paidAmount: z.number().min(0, t("pos.validation.minZero")),
    orderDiscount: z.number().min(0, t("pos.validation.minZero")),
    deliveryFee: z.number().min(0, t("pos.validation.minZero")),
    orderDate: z.string().min(1, t("pos.validation.dateRequired")),
    notes: optionalString(1000),
  });

export type CheckoutFormValues = z.infer<
  ReturnType<typeof getCheckoutSchema>
>;

export function validatePaidAmount(
  paidAmount: number,
  netTotal: number,
  t: (key: string) => string,
): string | null {
  const effectivePaid = paidAmount > 0 ? paidAmount : netTotal;
  if (effectivePaid < netTotal) {
    return t("pos.sale.paidTooLow");
  }
  return null;
}
