import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/common/services/auth";

interface UserState {
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;
}

const initialState: UserState = {
  user: null,
  isLoading: true,
  isHydrated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setHydrated: (state) => {
      state.isHydrated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isLoading = false;
    },
  },
});

export const { setUser, setLoading, setHydrated, clearUser } =
  userSlice.actions;
export default userSlice.reducer;
