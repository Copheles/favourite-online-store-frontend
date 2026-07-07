import { z } from "zod";
import { optionalString } from "@/validation/common.validation";

export const getCustomerSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t("pos.validation.nameRequired"))
      .max(128, t("pos.validation.max128")),
    phone: optionalString(32),
    address: optionalString(255),
    note: optionalString(500),
  });

export type CustomerFormValues = z.infer<
  ReturnType<typeof getCustomerSchema>
>;
