import { axiosClient } from "@/lib/axios";
import { toQueryString } from "@/lib/queryParams";
import type {
  Expense,
  ExpenseInput,
  PaginatedResponse,
  PaymentType,
} from "@/types/api";

export interface ListExpensesParams {
  branchId?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  paymentType?: PaymentType;
  category?: string;
  page?: number;
  limit?: number;
}

export async function listExpenses(
  params: ListExpensesParams = {},
): Promise<PaginatedResponse<Expense>> {
  const { data } = await axiosClient.get<PaginatedResponse<Expense>>(
    `/api/expenses${toQueryString(params)}`,
  );
  return data;
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const { data } = await axiosClient.post<Expense>("/api/expenses", input);
  return data;
}

export async function updateExpense(
  id: string,
  input: Partial<ExpenseInput>,
): Promise<Expense> {
  const { data } = await axiosClient.patch<Expense>(
    `/api/expenses/${id}`,
    input,
  );
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  await axiosClient.delete(`/api/expenses/${id}`);
}
