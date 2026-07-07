import { useLayoutEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { me } from "@/apis/auth.api";
import { STALE_TIME } from "@/lib/queryConfig";
import { queryKeys } from "@/lib/queryKeys";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setUser } from "@/redux/slices/authSlice";

export function useAuthBootstrap() {
  const dispatch = useAppDispatch();
  const loggingOut = useAppSelector((state) => state.auth.loggingOut);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => me(),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !loggingOut,
    staleTime: STALE_TIME.auth,
    gcTime: STALE_TIME.auth,
  });

  useLayoutEffect(() => {
    if (loggingOut) return;

    if (query.isSuccess && query.data) {
      dispatch(setUser(query.data));
      return;
    }

    // Do not wipe a fresh login when the earlier /auth/me probe is still in error state.
    if (query.isError && !isAuthenticated) {
      dispatch(setUser(null));
    }
  }, [
    loggingOut,
    query.isSuccess,
    query.isError,
    query.data,
    isAuthenticated,
    dispatch,
  ]);

  return query;
}
