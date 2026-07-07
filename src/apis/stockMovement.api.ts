import { axiosClient } from "@/lib/axios";
import { toQueryString } from "@/lib/queryParams";
import type { PaginatedResponse } from "@/types/api";

export type StockMovementType = "IN" | "OUT" | "OUT_RETURN" | "REPACK";

export interface StockMovementProductRef {
  id: string;
  name: string;
  code: string;
  barcode: string | null;
  stockQty: number;
}

export interface StockMovementUserRef {
  id: string;
  username: string;
  role: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName?: string;
  productCode?: string;
  type: StockMovementType;
  quantity: number;
  buyPrice: number | null;
  note: string | null;
  purchaseDate: string;
  createdAt: string;
  product?: StockMovementProductRef;
  createdBy?: StockMovementUserRef | null;
}

export interface CreateStockMovementInput {
  productId: string;
  type: StockMovementType;
  quantity: number;
  buyPrice?: number | null;
  purchaseDate?: string | null;
  note?: string | null;
}

export interface ListStockMovementsParams {
  productId?: string;
  type?: StockMovementType;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function listStockMovements(
  params: ListStockMovementsParams = {},
): Promise<PaginatedResponse<StockMovement>> {
  const { data } = await axiosClient.get<PaginatedResponse<StockMovement>>(
    `/api/stock-movements${toQueryString(params)}`,
  );
  return data;
}

export async function createStockMovement(
  input: CreateStockMovementInput,
): Promise<StockMovement> {
  const { data } = await axiosClient.post<StockMovement>(
    "/api/stock-movements",
    input,
  );
  return data;
}
