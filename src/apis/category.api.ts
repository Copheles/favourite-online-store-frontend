import { axiosClient } from "@/lib/axios";
import { toQueryString } from "@/lib/queryParams";
import type { Category, CategoryInput, PaginatedResponse } from "@/types/api";

export interface ListCategoriesParams {
  search?: string;
  type?: "TOP" | "SUB";
  parentId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

function normalizeCategories(
  data: Category[] | PaginatedResponse<Category>,
  params: ListCategoriesParams,
): PaginatedResponse<Category> {
  const rawItems = Array.isArray(data) ? data : data.items;

  let items = rawItems;
  if (params.type) {
    items = items.filter((c) => c.type === params.type);
  }
  if (params.parentId) {
    items = items.filter((c) => c.parentId === params.parentId);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    items = items.filter((c) => c.name.toLowerCase().includes(q));
  }

  const page = params.page ?? 1;
  const limit = params.limit ?? (items.length || 200);
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit);

  return {
    items: paged,
    meta: {
      page,
      limit,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / limit)),
    },
  };
}

export async function listCategories(
  params: ListCategoriesParams = {},
): Promise<PaginatedResponse<Category>> {
  const { data } = await axiosClient.get<
    Category[] | PaginatedResponse<Category>
  >(`/api/categories${toQueryString(params)}`);
  return normalizeCategories(data, params);
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const { data } = await axiosClient.post<Category>("/api/categories", input);
  return data;
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
): Promise<Category> {
  const { data } = await axiosClient.patch<Category>(
    `/api/categories/${id}`,
    input,
  );
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await axiosClient.delete(`/api/categories/${id}`);
}
