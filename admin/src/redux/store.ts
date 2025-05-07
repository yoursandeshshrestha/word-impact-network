import { configureStore } from "@reduxjs/toolkit";
import applicationsReducer from "./features/applicationsSlice";
// Import other reducers as needed

export const store = configureStore({
  reducer: {
    applications: applicationsReducer,
    // Add other reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
