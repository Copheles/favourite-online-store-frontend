export type Role = "admin" | "staff";

export interface AuthUser {
  role: Role;
  username: string;
  staffId?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface FieldErrors {
  [field: string]: string;
}

export interface ApiError {
  message: string;
  errors?: FieldErrors;
}
