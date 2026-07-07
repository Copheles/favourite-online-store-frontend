import { useQuery } from "@tanstack/react-query";
import {
  getCashSummary,
  getSalesReport,
  type CashSummaryParams,
  type SalesReportParams,
} from "@/apis/report.api";
import { STALE_TIME } from "@/lib/queryConfig";
import { queryKeys } from "@/lib/queryKeys";

export function useSalesReport(params: SalesReportParams) {
  return useQuery({
    queryKey: queryKeys.reports.sales(params),
    queryFn: () => getSalesReport(params),
    staleTime: STALE_TIME.reports,
    placeholderData: (prev) => prev,
  });
}

export function useCashSummary(params: CashSummaryParams) {
  return useQuery({
    queryKey: queryKeys.reports.cashSummary(params),
    queryFn: () => getCashSummary(params),
    staleTime: STALE_TIME.reports,
    placeholderData: (prev) => prev,
  });
}
