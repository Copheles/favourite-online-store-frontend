import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer,
  type ListCustomersParams,
} from "@/apis/customer.api";
import type { Customer, CustomerInput } from "@/types/api";
import { STALE_TIME } from "@/lib/queryConfig";
import { queryKeys } from "@/lib/queryKeys";

export function useCustomers(params: ListCustomersParams) {
  return useQuery({
    queryKey: queryKeys.customers.list(params),
    queryFn: () => listCustomers(params),
    staleTime: STALE_TIME.catalog,
    placeholderData: (prev) => prev,
  });
}

export function useCustomerMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });

  const create = useMutation({
    mutationFn: (input: CustomerInput) => createCustomer(input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CustomerInput> }) =>
      updateCustomer(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.customers.all });
      const snapshots = queryClient.getQueriesData<{
        items: Customer[];
      }>({ queryKey: queryKeys.customers.all });

      snapshots.forEach(([key, data]) => {
        if (!data) return;
        queryClient.setQueryData(key, {
          ...data,
          items: data.items.map((c) =>
            c.id === id ? { ...c, ...input } : c,
          ),
        });
      });

      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
