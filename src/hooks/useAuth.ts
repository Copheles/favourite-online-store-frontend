import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export function useAuth() {
  const { user, isAuthenticated, loggingOut } = useSelector(
    (state: RootState) => state.auth,
  );

  return {
    user,
    isAuthenticated,
    loggingOut,
    isAdmin: user?.role?.toLowerCase() === "admin",
    isStaff: user?.role?.toLowerCase() === "staff",
  };
}
