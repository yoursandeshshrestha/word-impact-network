import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import publicCoursesReducer from "./features/publicCourses/publicCourses";
export const store = configureStore({
  reducer: {
    publicCourses: publicCoursesReducer,
    // Add other reducers here as needed
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types since they might contain non-serializable values
        ignoredActions: ["dashboard/fetchOverallProgressSuccess"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = (
  dispatch: AppDispatch,
  getState: () => RootState
) => ReturnType;

export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
