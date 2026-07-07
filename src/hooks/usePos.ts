import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { logout as logoutApi } from "@/apis/auth.api";
import { checkout } from "@/apis/checkout.api";
import { listCustomers } from "@/apis/customer.api";
import {
  listPosProducts,
  type ListPosProductsParams,
} from "@/apis/pos.api";
import type { CheckoutInput } from "@/types/api";
import { PAGE_SIZE, STALE_TIME } from "@/lib/queryConfig";
import { queryKeys } from "@/lib/queryKeys";
import { useAppDispatch } from "@/redux/hooks";
import { logout as logoutAction, completeLogout } from "@/redux/slices/authSlice";
import { beginLogout, endLogout } from "@/lib/authSession";
import { useNavigate } from "react-router-dom";

type PosProductsOptions = {
  keepPrevious?: boolean;
  enabled?: boolean;
};

export function usePosProducts(
  params: ListPosProductsParams,
  options: PosProductsOptions = {},
) {
  const { keepPrevious = true, enabled = true } = options;
  return useQuery({
    queryKey: queryKeys.pos.list(params),
    queryFn: () => listPosProducts(params),
    staleTime: STALE_TIME.transactional,
    enabled,
    ...(keepPrevious ? { placeholderData: (prev: Awaited<ReturnType<typeof listPosProducts>> | undefined) => prev } : {}),
  });
}

/** Exact barcode lookup — never reuse stale catalog data. */
export function useBarcodeLookup() {
  return useMutation({
    mutationFn: (barcode: string) =>
      listPosProducts({ barcode, page: 1, limit: 1 }),
  });
}

export function usePrefetchSaleData() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.customers.list({
        page: 1,
        limit: 100,
        isActive: true,
      }),
      queryFn: () =>
        listCustomers({ page: 1, limit: 100, isActive: true }),
      staleTime: STALE_TIME.catalog,
    });
    queryClient.prefetchQuery({
      queryKey: queryKeys.pos.list({ page: 1, limit: PAGE_SIZE.saleProducts }),
      queryFn: () =>
        listPosProducts({ page: 1, limit: PAGE_SIZE.saleProducts }),
      staleTime: STALE_TIME.transactional,
    });
  };
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CheckoutInput) => checkout(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.pos.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onMutate: () => {
      beginLogout();
      dispatch(logoutAction());
      queryClient.cancelQueries();
      navigate("/login", { replace: true });
    },
    onSettled: () => {
      queryClient.removeQueries();
      dispatch(completeLogout());
      endLogout();
    },
  });
}
