export function readUrlPage(
  searchParams: URLSearchParams,
  defaultPage = 1,
): number {
  const raw = Number(searchParams.get("page"));
  if (!Number.isFinite(raw) || raw < 1) return defaultPage;
  return Math.floor(raw);
}

export function writeUrlPage(
  params: URLSearchParams,
  page: number,
  defaultPage = 1,
) {
  if (page <= defaultPage) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
}

export function readUrlString(
  searchParams: URLSearchParams,
  key: string,
  defaultValue = "",
): string {
  return searchParams.get(key) ?? defaultValue;
}

export function writeUrlString(
  params: URLSearchParams,
  key: string,
  value: string,
  defaultValue = "",
) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === defaultValue) {
    params.delete(key);
  } else {
    params.set(key, trimmed);
  }
}

export function resetUrlPage(params: URLSearchParams) {
  params.delete("page");
}

export function readUrlLimit(
  searchParams: URLSearchParams,
  defaultLimit: number,
  allowed: readonly number[],
): number {
  const raw = Number(searchParams.get("limit"));
  if (!Number.isFinite(raw) || !allowed.includes(raw)) return defaultLimit;
  return raw;
}

export function writeUrlLimit(
  params: URLSearchParams,
  limit: number,
  defaultLimit: number,
) {
  if (limit === defaultLimit) {
    params.delete("limit");
  } else {
    params.set("limit", String(limit));
  }
}
