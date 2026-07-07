import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOrder,
  getOrderReceipt,
  listOrders,
  updateOrderStatus,
  type ListOrdersParams,
} from "@/apis/order.api";
import type { OrderStatus } from "@/types/api";
import { STALE_TIME } from "@/lib/queryConfig";
import { queryKeys } from "@/lib/queryKeys";
import { todayISO } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";

export function useOrders(params: ListOrdersParams) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => listOrders(params),
    staleTime: STALE_TIME.transactional,
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  });
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id ?? ""),
    queryFn: () => getOrder(id!),
    enabled: !!id,
    staleTime: STALE_TIME.transactional,
  });
}

export function useOrderReceipt(id: string | null) {
  return useQuery({
    queryKey: queryKeys.orders.receipt(id ?? ""),
    queryFn: () => getOrderReceipt(id!),
    enabled: !!id,
    staleTime: STALE_TIME.transactional,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: Extract<OrderStatus, "COMPLETED" | "CANCELLED">;
    }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.pos.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.all });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

export function useTodayOrderCount() {
  const { isAuthenticated } = useAuth();
  const today = todayISO();
  return useQuery({
    queryKey: queryKeys.orders.todayCount(today),
    queryFn: () =>
      listOrders({ fromDate: today, toDate: today, page: 1, limit: 1 }),
    select: (data) => data.meta.total,
    staleTime: STALE_TIME.transactional,
    enabled: isAuthenticated,
  });
}

export function usePrefetchTodayOrders() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const today = todayISO();
  return () => {
    if (!isAuthenticated) return;
    queryClient.prefetchQuery({
      queryKey: queryKeys.orders.list({
        fromDate: today,
        toDate: today,
        page: 1,
        limit: 20,
      }),
      queryFn: () =>
        listOrders({ fromDate: today, toDate: today, page: 1, limit: 20 }),
      staleTime: STALE_TIME.transactional,
    });
  };
}
