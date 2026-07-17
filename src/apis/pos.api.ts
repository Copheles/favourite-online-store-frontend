import { axiosClient } from "@/lib/axios";
import { toQueryString } from "@/lib/queryParams";
import type { PaginatedResponse, PosProduct, StockStatus } from "@/types/api";

export interface ListPosProductsParams {
  branchId?: string;
  search?: string;
  topCategoryId?: string;
  subCategoryId?: string;
  barcode?: string;
  stockStatus?: StockStatus;
  page?: number;
  limit?: number;
}

export async function listPosProducts(
  params: ListPosProductsParams = {},
): Promise<PaginatedResponse<PosProduct>> {
  const { data } = await axiosClient.get<PaginatedResponse<PosProduct>>(
    `/api/pos/products${toQueryString(params)}`,
  );
  return data;
}
