import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import publicCoursesReducer from "./features/publicCourses/publicCourses";
import userReducer from "./features/userSlice";
import enrolledCoursesReducer from "./features/enrolledCourses/enrolledCourses";
import studentProfileReducer from "./features/studentProfile/studentProfile";
import coursesReducer from "./features/courses/courses";
import coursePreviewReducer from "./features/courses/coursePreview";
import courseEnrollmentReducer from "./features/courseEnrollment/courseEnrollment";
import myLearningReducer from "./features/myLearningSlice/myLearningSlice";
import courseDetailReducer from "./features/courseDetail/courseDetailSlice";
import chapterDetailReducer from "./features/chapterDetail/chapterDetailSlice";
import examReducer from "./features/exam/examSlice";

interface EnrollmentState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export const store = configureStore({
  reducer: {
    publicCourses: publicCoursesReducer,
    user: userReducer,
    enrolledCourses: enrolledCoursesReducer,
    studentProfile: studentProfileReducer,
    courses: coursesReducer,
    coursePreview: coursePreviewReducer,
    courseEnrollment: courseEnrollmentReducer,
    myLearning: myLearningReducer,
    courseDetail: courseDetailReducer,
    chapterDetail: chapterDetailReducer,
    exam: examReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types since they might contain non-serializable values
        ignoredActions: [
          "dashboard/fetchOverallProgressSuccess",
          "studentProfile/fetchProfile/fulfilled",
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState> & {
  enrollment: EnrollmentState;
};
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = (
  dispatch: AppDispatch,
  getState: () => RootState
) => ReturnType;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector<RootState>;

export default store;
