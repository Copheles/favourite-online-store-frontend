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
import { clearBranches } from "@/redux/slices/branchSlice";
import { beginLogout, endLogout } from "@/lib/authSession";
import { useNavigate } from "react-router-dom";
import { useBranch } from "./useBranch";

type PosProductsOptions = {
  keepPrevious?: boolean;
  enabled?: boolean;
};

/** Sale catalog + checkout use the active branch (staff locked to home). */
function useSaleBranchId() {
  const { currentBranchId, defaultBranchId } = useBranch();
  return currentBranchId ?? defaultBranchId;
}

export function usePosProducts(
  params: Omit<ListPosProductsParams, "branchId"> = {},
  options: PosProductsOptions = {},
) {
  const { keepPrevious = true, enabled = true } = options;
  const saleBranchId = useSaleBranchId();

  return useQuery({
    queryKey: queryKeys.pos.list({ ...params, branchId: saleBranchId }),
    queryFn: () => listPosProducts({ ...params, branchId: saleBranchId }),
    staleTime: STALE_TIME.transactional,
    enabled: enabled && !!saleBranchId,
    ...(keepPrevious
      ? {
          placeholderData: (
            prev: Awaited<ReturnType<typeof listPosProducts>> | undefined,
          ) => prev,
        }
      : {}),
  });
}

/** Exact barcode lookup — never reuse stale catalog data. */
export function useBarcodeLookup() {
  const saleBranchId = useSaleBranchId();

  return useMutation({
    mutationFn: (barcode: string) =>
      listPosProducts({ branchId: saleBranchId, barcode, page: 1, limit: 1 }),
  });
}

export function usePrefetchSaleData() {
  const queryClient = useQueryClient();
  const saleBranchId = useSaleBranchId();

  return () => {
    if (!saleBranchId) return;

    queryClient.prefetchQuery({
      queryKey: queryKeys.customers.list({
        page: 1,
        limit: 100,
        isActive: true,
        branchId: saleBranchId,
      }),
      queryFn: () =>
        listCustomers({
          page: 1,
          limit: 100,
          isActive: true,
          branchId: saleBranchId,
        }),
      staleTime: STALE_TIME.catalog,
    });
    queryClient.prefetchQuery({
      queryKey: queryKeys.pos.list({
        branchId: saleBranchId,
        page: 1,
        limit: PAGE_SIZE.saleProducts,
      }),
      queryFn: () =>
        listPosProducts({
          branchId: saleBranchId,
          page: 1,
          limit: PAGE_SIZE.saleProducts,
        }),
      staleTime: STALE_TIME.transactional,
    });
  };
}

export function useCheckout() {
  const queryClient = useQueryClient();
  const saleBranchId = useSaleBranchId();

  return useMutation({
    mutationFn: (input: Omit<CheckoutInput, "branchId">) =>
      checkout({ ...input, branchId: saleBranchId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.pos.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
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
      dispatch(clearBranches());
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
