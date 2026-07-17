import type { PosProduct } from "@/types/api";
import { toMoney } from "@/lib/format";

export interface CartLine {
  product: PosProduct;
  quantity: number;
  unitPrice?: number;
  discount?: number;
}

export function getUnitPrice(line: CartLine): number {
  return toMoney(line.unitPrice ?? line.product.sellingPrice);
}

export function getLineDiscount(line: CartLine): number {
  return toMoney(line.discount ?? line.product.discount);
}

export function getLineFinalPrice(line: CartLine): number {
  return Math.max(getUnitPrice(line) - getLineDiscount(line), 0);
}

export function calcLineTotal(line: CartLine): number {
  return toMoney(getLineFinalPrice(line) * line.quantity);
}

export function calcCartSubtotal(lines: CartLine[]): number {
  return toMoney(lines.reduce((sum, line) => sum + calcLineTotal(line), 0));
}

export function calcItemDiscountTotal(lines: CartLine[]): number {
  return toMoney(
    lines.reduce(
      (sum, line) => sum + getLineDiscount(line) * line.quantity,
      0,
    ),
  );
}

export function calcNetTotal(
  lines: CartLine[],
  orderDiscount = 0,
  deliveryFee = 0,
  taxAmount = 0,
): number {
  return Math.max(
    toMoney(
      calcCartSubtotal(lines) -
        toMoney(orderDiscount) +
        toMoney(deliveryFee) +
        toMoney(taxAmount),
    ),
    0,
  );
}
