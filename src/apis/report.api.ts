import { axiosClient } from "@/lib/axios";
import { toQueryString } from "@/lib/queryParams";
import type {
  Availability,
  CashSummaryResponse,
  InventoryBalanceResponse,
  PaymentType,
  SalesReportResponse,
  StockStatus,
} from "@/types/api";

export interface InventoryBalanceParams {
  search?: string;
  topCategoryId?: string;
  subCategoryId?: string;
  availability?: Availability;
  stockStatus?: StockStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getInventoryBalance(
  params: InventoryBalanceParams = {},
): Promise<InventoryBalanceResponse> {
  const { data } = await axiosClient.get<InventoryBalanceResponse>(
    `/api/reports/inventory-balance${toQueryString(params)}`,
  );
  return data;
}

export interface SalesReportParams {
  fromDate?: string;
  toDate?: string;
  topCategoryId?: string;
  subCategoryId?: string;
  productId?: string;
  paymentType?: PaymentType;
  page?: number;
  limit?: number;
}

export async function getSalesReport(
  params: SalesReportParams = {},
): Promise<SalesReportResponse> {
  const { data } = await axiosClient.get<SalesReportResponse>(
    `/api/reports/sales${toQueryString(params)}`,
  );
  return data;
}

export interface CashSummaryParams {
  date?: string;
  fromDate?: string;
  toDate?: string;
  cashierId?: string;
}

export async function getCashSummary(
  params: CashSummaryParams = {},
): Promise<CashSummaryResponse> {
  const { data } = await axiosClient.get<CashSummaryResponse>(
    `/api/reports/cash-summary${toQueryString(params)}`,
  );
  return data;
}
