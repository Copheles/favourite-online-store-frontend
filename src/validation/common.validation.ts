import { z } from "zod";

export const paymentTypeSchema = z.enum([
  "CASH",
  "KBZPAY",
  "WAVEPAY",
  "CARD",
  "BANKING",
]);

export const stockMovementTypeSchema = z.enum([
  "IN",
  "OUT",
  "OUT_RETURN",
  "REPACK",
]);

export const staffRoleSchema = z.enum(["admin", "staff"]);

export function optionalString(max = 255) {
  return z.string().max(max).optional().or(z.literal(""));
}
