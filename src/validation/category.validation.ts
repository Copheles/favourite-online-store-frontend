import { z } from "zod";

export const getCategorySchema = (t: (key: string) => string) =>
  z
    .object({
      name: z
        .string()
        .min(1, t("pos.validation.nameRequired"))
        .max(128, t("pos.validation.max128")),
      type: z.enum(["TOP", "SUB"]),
      parentId: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      if (values.type === "SUB" && !values.parentId?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["parentId"],
          message: t("pos.validation.parentCategoryRequired"),
        });
      }
    });

export type CategoryFormValues = z.infer<ReturnType<typeof getCategorySchema>>;

export const categoryFormDefaults: CategoryFormValues = {
  name: "",
  type: "TOP",
  parentId: "",
};
