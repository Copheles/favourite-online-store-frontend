import { axiosClient } from "@/lib/axios";
import { toQueryString } from "@/lib/queryParams";
import type {
  Customer,
  CustomerInput,
  PaginatedResponse,
} from "@/types/api";

export interface ListCustomersParams {
  search?: string;
  contact?: "WITH_PHONE" | "NO_PHONE";
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export async function listCustomers(
  params: ListCustomersParams = {},
): Promise<PaginatedResponse<Customer>> {
  const { data } = await axiosClient.get<PaginatedResponse<Customer>>(
    `/api/customers${toQueryString(params)}`,
  );
  return data;
}

export async function getCustomer(id: string): Promise<Customer> {
  const { data } = await axiosClient.get<Customer>(`/api/customers/${id}`);
  return data;
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const { data } = await axiosClient.post<Customer>("/api/customers", input);
  return data;
}

export async function updateCustomer(
  id: string,
  input: Partial<CustomerInput>,
): Promise<Customer> {
  const { data } = await axiosClient.patch<Customer>(
    `/api/customers/${id}`,
    input,
  );
  return data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await axiosClient.delete(`/api/customers/${id}`);
}
