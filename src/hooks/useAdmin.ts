import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changePassword, createStaff } from "@/apis/admin.api";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/apis/category.api";
import {
  createExpense,
  deleteExpense,
  listExpenses,
  updateExpense,
  type ListExpensesParams,
} from "@/apis/expense.api";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
  type ListProductsParams,
} from "@/apis/product.api";
import { createStockMovement } from "@/apis/stockMovement.api";
import type {
  CategoryInput,
  ChangePasswordInput,
  ExpenseInput,
  Product,
  ProductInput,
  StaffInput,
} from "@/types/api";
import { STALE_TIME } from "@/lib/queryConfig";
import { queryKeys } from "@/lib/queryKeys";
import type { ProductFormValues } from "@/validation/settings.validation";
import { useBranch } from "./useBranch";

export function useProducts(params: Omit<ListProductsParams, "branchId"> = {}) {
  const { currentBranchId } = useBranch();
  
  return useQuery({
    queryKey: queryKeys.products.list({ ...params, branchId: currentBranchId }),
    queryFn: () => listProducts({ ...params, branchId: currentBranchId }),
    staleTime: STALE_TIME.catalog,
    enabled: !!currentBranchId,
  });
}

export function useProduct(id: string | null) {
  const { currentBranchId } = useBranch();

  return useQuery({
    queryKey: queryKeys.products.detail(id ?? "", currentBranchId),
    queryFn: () => getProductById(id!, currentBranchId),
    enabled: Boolean(id) && !!currentBranchId,
    staleTime: STALE_TIME.catalog,
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { currentBranchId } = useBranch();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<ProductInput>;
    }) => updateProduct(id, input, currentBranchId),
    onSuccess: () => invalidateCatalogQueries(queryClient),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { currentBranchId } = useBranch();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id, currentBranchId),
    onSuccess: () => invalidateCatalogQueries(queryClient),
  });
}

export function useCategories(type?: "TOP" | "SUB") {
  const { currentBranchId } = useBranch();

  return useQuery({
    queryKey: queryKeys.categories.list({ type, branchId: currentBranchId }),
    queryFn: () =>
      listCategories({
        type,
        isActive: true,
        page: 1,
        limit: 200,
        branchId: currentBranchId,
      }),
    staleTime: STALE_TIME.static,
    enabled: !!currentBranchId,
  });
}

export function useCategoriesManage(params: {
  search?: string;
  type?: "TOP" | "SUB";
  page: number;
  limit: number;
}) {
  const { currentBranchId } = useBranch();

  return useQuery({
    queryKey: [
      ...queryKeys.categories.all,
      "manage",
      { ...params, branchId: currentBranchId },
    ],
    queryFn: () =>
      listCategories({
        search: params.search,
        type: params.type,
        page: params.page,
        limit: params.limit,
        branchId: currentBranchId,
      }),
    staleTime: STALE_TIME.static,
    enabled: !!currentBranchId,
  });
}

export function useExpenses(params: Omit<ListExpensesParams, "branchId"> = {}) {
  const { currentBranchId } = useBranch();
  
  return useQuery({
    queryKey: queryKeys.expenses.list({ ...params, branchId: currentBranchId }),
    queryFn: () => listExpenses({ ...params, branchId: currentBranchId }),
    staleTime: STALE_TIME.transactional,
    enabled: !!currentBranchId,
  });
}

function invalidateCatalogQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.pos.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.stock.all });
}

export function useCreateProductWithStock() {
  const queryClient = useQueryClient();
  const { currentBranchId } = useBranch();

  return useMutation({
    mutationFn: async (values: ProductFormValues): Promise<Product> => {
      const productInput: ProductInput = {
        name: values.name,
        code: values.code,
        barcode: values.barcode?.trim() || null,
        sellingPrice: values.sellingPrice,
        discount: values.discount || 0,
        topCategoryId: values.topCategoryId,
        subCategoryId: values.subCategoryId,
        availability: "AVAILABLE",
        type: "STOCK_CONTROL",
      };

      const product = await createProduct(productInput, currentBranchId);

      if (values.initialStockQty > 0) {
        await createStockMovement({
          productId: product.id,
          branchId: currentBranchId,
          type: "IN",
          quantity: values.initialStockQty,
          buyPrice: values.buyPrice > 0 ? values.buyPrice : null,
          note: "Initial stock on product create",
        });
      }

      return product;
    },
    onSuccess: () => invalidateCatalogQueries(queryClient),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { currentBranchId } = useBranch();
  return useMutation({
    mutationFn: (input: CategoryInput) =>
      createCategory(input, currentBranchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { currentBranchId } = useBranch();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<CategoryInput>;
    }) => updateCategory(id, input, currentBranchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { currentBranchId } = useBranch();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id, currentBranchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useAdminMutations() {
  const queryClient = useQueryClient();
  const { currentBranchId } = useBranch();
  const invalidateExpenses = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
  const invalidateReports = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });

  return {
    createProduct: useMutation({
      mutationFn: (input: ProductInput) => createProduct(input, currentBranchId),
      onSuccess: () => invalidateCatalogQueries(queryClient),
    }),
    updateProduct: useMutation({
      mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) =>
        updateProduct(id, input, currentBranchId),
      onSuccess: () => invalidateCatalogQueries(queryClient),
    }),
    deleteProduct: useMutation({
      mutationFn: (id: string) => deleteProduct(id, currentBranchId),
      onSuccess: () => invalidateCatalogQueries(queryClient),
    }),
    createExpense: useMutation({
      mutationFn: (input: ExpenseInput) => createExpense(input),
      onSuccess: () => {
        invalidateExpenses();
        invalidateReports();
      },
    }),
    updateExpense: useMutation({
      mutationFn: ({ id, input }: { id: string; input: Partial<ExpenseInput> }) =>
        updateExpense(id, input),
      onSuccess: () => {
        invalidateExpenses();
        invalidateReports();
      },
    }),
    deleteExpense: useMutation({
      mutationFn: (id: string) => deleteExpense(id),
      onSuccess: () => {
        invalidateExpenses();
        invalidateReports();
      },
    }),
    createStaff: useMutation({
      mutationFn: (input: StaffInput) => createStaff(input),
    }),
    changePassword: useMutation({
      mutationFn: (input: ChangePasswordInput) => changePassword(input),
    }),
  };
}
