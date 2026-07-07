import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/redux/hooks";
import { logout, completeLogout } from "@/redux/slices/authSlice";
import { beginLogout, endLogout, isLoggingOut } from "@/lib/authSession";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, loggingOut } = useAuth();
  const isAuthenticatedRef = useRef(isAuthenticated);
  const bootstrap = useAuthBootstrap();

  isAuthenticatedRef.current = isAuthenticated;

  const authReady =
    loggingOut ||
    isAuthenticated ||
    (bootstrap.isFetched && (bootstrap.isSuccess || bootstrap.isError));

  useEffect(() => {
    function handleUnauthorized() {
      if (!isAuthenticatedRef.current) return;
      if (isLoggingOut()) return;
      if (window.location.pathname.startsWith("/login")) return;

      beginLogout();
      dispatch(logout());
      queryClient.cancelQueries();
      navigate("/login", { replace: true });

      window.setTimeout(() => {
        queryClient.removeQueries();
        dispatch(completeLogout());
        endLogout();
      }, 0);
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [dispatch, navigate, queryClient]);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return children;
}
