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
import dashboardReducer from "./features/dashboardSlice";
import messagesReducer from "./features/messagesSlice";
import notificationsReducer from "./features/notificationsSlice";
import analyticsReducer from "./features/analyticsSlice";
import announcementsReducer from "./features/announcementsSlice";
import newsReducer from "./features/newsSlice";
import paymentsReducer from "./features/payments/paymentsSlice";

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
    dashboard: dashboardReducer,
    messages: messagesReducer,
    notifications: notificationsReducer,
    analytics: analyticsReducer,
    announcements: announcementsReducer,
    news: newsReducer,
    payments: paymentsReducer,
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
