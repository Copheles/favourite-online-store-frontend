import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStockMovement,
  listStockMovements,
  type CreateStockMovementInput,
  type ListStockMovementsParams,
} from "@/apis/stockMovement.api";
import {
  getInventoryBalance,
  type InventoryBalanceParams,
} from "@/apis/report.api";
import {
  exportProductsExcel,
  importProductsExcel,
  type ExportProductsExcelParams,
} from "@/apis/product.api";
import { STALE_TIME } from "@/lib/queryConfig";
import { queryKeys } from "@/lib/queryKeys";

export function useInventoryBalance(params: InventoryBalanceParams) {
  return useQuery({
    queryKey: queryKeys.stock.balance(params),
    queryFn: () => getInventoryBalance(params),
    staleTime: STALE_TIME.reports,
    placeholderData: (prev) => prev,
  });
}

export function useStockMovements(params: ListStockMovementsParams) {
  return useQuery({
    queryKey: queryKeys.stock.movements(params),
    queryFn: () => listStockMovements(params),
    staleTime: STALE_TIME.transactional,
    placeholderData: (prev) => prev,
  });
}

export function useStockMovementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStockMovementInput) => createStockMovement(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.all });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.pos.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

function invalidateStockCatalog(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.stock.all });
  queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
  queryClient.invalidateQueries({ queryKey: queryKeys.pos.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
}

export function useProductExcelImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, dryRun = false }: { file: File; dryRun?: boolean }) =>
      importProductsExcel(file, dryRun),
    onSuccess: (_result, variables) => {
      if (!variables.dryRun) {
        invalidateStockCatalog(queryClient);
      }
    },
  });
}

export function useProductExcelExport() {
  return useMutation({
    mutationFn: (params: ExportProductsExcelParams) => exportProductsExcel(params),
  });
}
