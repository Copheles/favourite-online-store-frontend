import { axiosClient } from "@/lib/axios";
import { toQueryString } from "@/lib/queryParams";
import type {
  Availability,
  PaginatedResponse,
  Product,
  ProductExcelImportSummary,
  ProductInput,
  StockStatus,
} from "@/types/api";

export interface ListProductsParams {
  search?: string;
  topCategoryId?: string;
  subCategoryId?: string;
  availability?: Availability;
  stockStatus?: StockStatus;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ExportProductsExcelParams {
  search?: string;
  topCategoryId?: string;
  subCategoryId?: string;
  availability?: Availability;
  stockStatus?: StockStatus;
}

export async function listProducts(
  params: ListProductsParams = {},
): Promise<PaginatedResponse<Product>> {
  const { data } = await axiosClient.get<PaginatedResponse<Product>>(
    `/api/products${toQueryString(params)}`,
  );
  return data;
}

export async function getProductById(id: string): Promise<Product> {
  const { data } = await axiosClient.get<Product>(`/api/products/${id}`);
  return data;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await axiosClient.post<Product>("/api/products", input);
  return data;
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<Product> {
  const { data } = await axiosClient.patch<Product>(
    `/api/products/${id}`,
    input,
  );
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await axiosClient.delete(`/api/products/${id}`);
}

export async function importProductsExcel(
  file: File,
  dryRun = false,
): Promise<ProductExcelImportSummary> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axiosClient.post<ProductExcelImportSummary>(
    `/api/products/import-excel${toQueryString({ dryRun })}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function exportProductsExcel(
  params: ExportProductsExcelParams = {},
): Promise<Blob> {
  const response = await axiosClient.get<Blob>(
    `/api/products/export-excel${toQueryString(params)}`,
    { responseType: "blob", validateStatus: () => true },
  );

  if (response.status >= 400) {
    const message = await readBlobErrorMessage(response.data);
    throw Object.assign(new Error(message), {
      response: { data: { message } },
    });
  }

  const blob = response.data;
  if (blob.type.includes("json")) {
    const message = await readBlobErrorMessage(blob);
    throw Object.assign(new Error(message), {
      response: { data: { message } },
    });
  }

  return blob;
}

async function readBlobErrorMessage(blob: Blob): Promise<string> {
  try {
    const text = await blob.text();
    const json = JSON.parse(text) as { message?: string };
    return json.message ?? "Export failed";
  } catch {
    return "Export failed";
  }
}
