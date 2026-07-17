import { axiosClient } from "@/lib/axios";
import type { ChangePasswordInput, StaffInput } from "@/types/api";

export async function createStaff(input: StaffInput): Promise<{ id: string }> {
  const { data } = await axiosClient.post<{ id: string }>("/admin/staff", {
    username: input.username,
    initialPassword: input.password,
    role: input.role,
    defaultBranchId: input.defaultBranchId,
    accessibleBranchIds: input.accessibleBranchIds,
  });

  return data;
}

export async function resetStaffPassword(
  id: string,
  password: string,
): Promise<{ ok: boolean }> {
  const { data } = await axiosClient.patch<{ ok: boolean }>(
    `/admin/staff/${id}/password`,
    { newPassword: password },
  );
  return data;
}

export async function changePassword(
  input: ChangePasswordInput,
): Promise<{ ok: boolean }> {
  const { data } = await axiosClient.patch<{ ok: boolean }>(
    "/auth/password",
    input,
  );
  return data;
}
