import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Branch } from "@/types/auth";

interface BranchState {
  currentBranchId: string | null;
  accessibleBranches: Branch[];
}

const initialState: BranchState = {
  currentBranchId: null,
  accessibleBranches: [],
};

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    setBranches: (
      state,
      action: PayloadAction<{ defaultBranch: Branch; accessibleBranches: Branch[] }>
    ) => {
      state.currentBranchId = action.payload.defaultBranch.id;
      state.accessibleBranches = action.payload.accessibleBranches;
    },
    switchBranch: (state, action: PayloadAction<string>) => {
      const branchExists = state.accessibleBranches.some(
        (branch) => branch.id === action.payload
      );
      if (branchExists) {
        state.currentBranchId = action.payload;
      }
    },
    clearBranches: (state) => {
      state.currentBranchId = null;
      state.accessibleBranches = [];
    },
  },
});

export const { setBranches, switchBranch, clearBranches } = branchSlice.actions;
export default branchSlice.reducer;
