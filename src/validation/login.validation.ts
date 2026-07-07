import { z } from "zod";

// Accept any translation function with the correct signature
export const getLoginSchema = (t: (key: string) => string) =>
  z.object({
    username: z
      .string()
      .min(1, t("login.errors.usernameRequired"))
      .max(128, t("login.errors.usernameMax"))
      .trim(),
    password: z
      .string()
      .min(1, t("login.errors.passwordRequired"))
      .max(128, t("login.errors.passwordMax")),
  });

export type LoginFormValues = z.infer<ReturnType<typeof getLoginSchema>>;
