import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loggingOut: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loggingOut: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loggingOut = true;
    },
    completeLogout: (state) => {
      state.loggingOut = false;
    },
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
});

export const { loginSuccess, logout, completeLogout, setUser } = authSlice.actions;
export default authSlice.reducer;
