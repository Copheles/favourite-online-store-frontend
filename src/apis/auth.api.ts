import { axiosClient } from "@/lib/axios";
import type { LoginCredentials, LoginResponse, AuthUser, BranchAccessResponse } from "@/types/auth";

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await axiosClient.post<LoginResponse>("/auth/login", credentials);
  return data;
}

export async function me(): Promise<AuthUser> {
  const { data } = await axiosClient.get<AuthUser>("/auth/me");
  return data;
}

export async function logout(): Promise<{ ok: boolean }> {
  const { data } = await axiosClient.post<{ ok: boolean }>("/auth/logout");
  return data;
}

export async function getAccessibleBranches(): Promise<BranchAccessResponse> {
  const { data } = await axiosClient.get<BranchAccessResponse>("/api/branches/accessible");
  return data;
}
