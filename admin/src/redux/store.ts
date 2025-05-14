import { configureStore } from "@reduxjs/toolkit";
import applicationsReducer from "./features/applicationsSlice";
import studentsReducer from "./features/studentsSlice";
import adminProfileReducer from "./features/adminProfileSlice";
import coursesReducer from "./features/coursesSlice";
import loadingReducer from "./features/loadingSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import chaptersReducer from "./features/chaptersSlice";
import videosReducer from "./features/videosSlice";
import examsReducer from "./features/examsSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["students", "adminProfile"], // Only persist these reducers
};

const persistedStudentsReducer = persistReducer(persistConfig, studentsReducer);
const persistedAdminProfileReducer = persistReducer(
  persistConfig,
  adminProfileReducer
);

export const store = configureStore({
  reducer: {
    applications: applicationsReducer,
    students: persistedStudentsReducer,
    adminProfile: persistedAdminProfileReducer,
    courses: coursesReducer,
    loading: loadingReducer,
    chapters: chaptersReducer,
    videos: videosReducer,
    exams: examsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
