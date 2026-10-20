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
  branchId?: string;
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
  branchId?: string;
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

export async function getProductById(
  id: string,
  branchId?: string,
): Promise<Product> {
  const { data } = await axiosClient.get<Product>(
    `/api/products/${id}${toQueryString({ branchId })}`,
  );
  return data;
}

export async function createProduct(
  input: ProductInput,
  branchId?: string,
): Promise<Product> {
  const { data } = await axiosClient.post<Product>(
    `/api/products${toQueryString({ branchId })}`,
    input,
  );
  return data;
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
  branchId?: string,
): Promise<Product> {
  const { data } = await axiosClient.patch<Product>(
    `/api/products/${id}${toQueryString({ branchId })}`,
    input,
  );
  return data;
}

export async function deleteProduct(
  id: string,
  branchId?: string,
): Promise<void> {
  await axiosClient.delete(
    `/api/products/${id}${toQueryString({ branchId })}`,
  );
}

export async function importProductsExcel(
  file: File,
  dryRun = false,
  branchId?: string,
): Promise<ProductExcelImportSummary> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axiosClient.post<ProductExcelImportSummary>(
    `/api/products/import-excel${toQueryString({ dryRun, branchId })}`,
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
