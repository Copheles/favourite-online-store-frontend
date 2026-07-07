import { QueryClient } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/queryConfig";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME.catalog,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry(failureCount, error) {
        if (!error || typeof error !== "object" || !("response" in error)) {
          return false;
        }
        return failureCount < 1;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
