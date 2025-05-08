import { configureStore } from "@reduxjs/toolkit";
import applicationsReducer from "./features/applicationsSlice";
import studentsReducer from "./features/studentsSlice";
import adminProfileReducer from "./features/adminProfileSlice";
export const store = configureStore({
  reducer: {
    applications: applicationsReducer,
    students: studentsReducer,
    adminProfile: adminProfileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
