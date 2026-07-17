import { useQuery } from "@tanstack/react-query";
import {
  getCashSummary,
  getSalesReport,
  type CashSummaryParams,
  type SalesReportParams,
} from "@/apis/report.api";
import { STALE_TIME } from "@/lib/queryConfig";
import { queryKeys } from "@/lib/queryKeys";
import { useBranch } from "./useBranch";

export function useSalesReport(params: Omit<SalesReportParams, "branchId"> = {}) {
  const { currentBranchId } = useBranch();
  
  return useQuery({
    queryKey: queryKeys.reports.sales({ ...params, branchId: currentBranchId }),
    queryFn: () => getSalesReport({ ...params, branchId: currentBranchId }),
    staleTime: STALE_TIME.reports,
    placeholderData: (prev) => prev,
    enabled: !!currentBranchId,
  });
}

export function useCashSummary(params: Omit<CashSummaryParams, "branchId"> = {}) {
  const { currentBranchId } = useBranch();
  
  return useQuery({
    queryKey: queryKeys.reports.cashSummary({ ...params, branchId: currentBranchId }),
    queryFn: () => getCashSummary({ ...params, branchId: currentBranchId }),
    staleTime: STALE_TIME.reports,
    placeholderData: (prev) => prev,
    enabled: !!currentBranchId,
  });
}
