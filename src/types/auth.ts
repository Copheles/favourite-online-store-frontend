export type Role = "admin" | "staff";

export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
}

export interface AuthUser {
  role: Role;
  username: string;
  staffId?: string;
  defaultBranchId: string;
  accessibleBranchIds: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface BranchAccessResponse {
  defaultBranch: Branch;
  accessibleBranches: Branch[];
}

export interface FieldErrors {
  [field: string]: string;
}

export interface ApiError {
  message: string;
  errors?: FieldErrors;
}
