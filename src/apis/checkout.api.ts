import { axiosClient } from "@/lib/axios";
import type { CheckoutInput, OrderDetail } from "@/types/api";

export async function checkout(input: CheckoutInput): Promise<OrderDetail> {
  const { data } = await axiosClient.post<OrderDetail>("/api/checkout", input);
  return data;
}
