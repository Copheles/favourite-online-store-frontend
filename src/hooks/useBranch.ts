import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import { switchBranch } from "@/redux/slices/branchSlice";
import { useAuth } from "./useAuth";

export function useBranch() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { currentBranchId: storedBranchId, accessibleBranches } = useSelector(
    (state: RootState) => state.branch,
  );

  const isAdmin = user?.role?.toLowerCase() === "admin";
  /** Cashiers are locked to their home branch; admins may view others. */
  const currentBranchId =
    (isAdmin
      ? storedBranchId
      : (user?.defaultBranchId ?? storedBranchId)) ?? undefined;

  const currentBranch = accessibleBranches.find(
    (branch) => branch.id === currentBranchId,
  );

  const isDefaultBranch = currentBranchId === user?.defaultBranchId;
  /** Catalog / product writes stay on default branch. */
  const canWriteCatalog = Boolean(isAdmin && isDefaultBranch);
  /** Admins may restock any accessible branch they are viewing. */
  const canRestock = Boolean(isAdmin && currentBranchId);
  /** Staff may record expenses on their home branch. */
  const canManageExpenses = Boolean(currentBranchId && isDefaultBranch);
  const canSwitchBranch = Boolean(isAdmin && accessibleBranches.length > 1);

  const handleSwitchBranch = (branchId: string) => {
    if (!isAdmin) return;
    dispatch(switchBranch(branchId));
  };

  return {
    currentBranchId,
    currentBranch,
    accessibleBranches,
    defaultBranchId: user?.defaultBranchId,
    isDefaultBranch,
    canWrite: canWriteCatalog,
    canWriteCatalog,
    canRestock,
    canManageExpenses,
    canSwitchBranch,
    switchBranch: handleSwitchBranch,
  };
}
