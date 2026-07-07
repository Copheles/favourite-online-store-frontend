import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/types/auth";

function formatFieldErrors(errors: Record<string, string | string[]>): string {
  return Object.values(errors)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .join(", ");
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as {
    response?: {
      data?: ApiError & { errors?: Record<string, string | string[]> };
    };
    message?: string;
  };
  if (err.response?.data?.message && err.response?.data?.errors) {
    return `${err.response.data.message}: ${formatFieldErrors(err.response.data.errors)}`;
  }
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.errors) {
    return formatFieldErrors(err.response.data.errors);
  }
  if (err.message) return err.message;
  return fallback;
}

export function ApiErrorAlert({
  error,
  fallback = "Something went wrong.",
  className,
}: {
  error: unknown;
  fallback?: string;
  className?: string;
}) {
  if (!error) return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <p className="min-w-0 leading-5">{getApiErrorMessage(error, fallback)}</p>
    </div>
  );
}
