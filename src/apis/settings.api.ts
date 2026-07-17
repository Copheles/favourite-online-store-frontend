import { axiosClient } from "@/lib/axios";

export interface StoreSettings {
  pointsCashbackPercent: number;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const { data } = await axiosClient.get<StoreSettings>("/api/settings");
  return data;
}

export async function updateStoreSettings(
  input: StoreSettings,
): Promise<StoreSettings> {
  const { data } = await axiosClient.patch<StoreSettings>("/api/settings", input);
  return data;
}
