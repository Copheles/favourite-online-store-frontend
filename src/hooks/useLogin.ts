import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "@/apis/auth.api";
import { suppressUnauthorizedEvents } from "@/lib/authSession";
import { queryKeys } from "@/lib/queryKeys";
import { loginSuccess } from "@/redux/slices/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import type { LoginCredentials } from "@/types/auth";

function getRedirectPath(state: unknown, fallback: string) {
  const from = (state as { from?: { pathname?: string } } | null)?.from
    ?.pathname;
  return from && from !== "/login" ? from : fallback;
}

export function useLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: (data) => {
      suppressUnauthorizedEvents(10_000);
      dispatch(loginSuccess(data.user));
      queryClient.resetQueries({ queryKey: queryKeys.auth.me(), exact: true });
      queryClient.setQueryData(queryKeys.auth.me(), data.user);
      navigate(getRedirectPath(location.state, "/dashboard"));
    },
  });
}
