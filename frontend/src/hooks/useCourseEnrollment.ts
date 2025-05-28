import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  enrollInCourse,
  clearEnrollment,
} from "@/redux/features/courseEnrollment/courseEnrollment";

export const useCourseEnrollment = () => {
  const dispatch = useAppDispatch();
  const { enrollmentData, status, error } = useAppSelector(
    (state) => state.courseEnrollment
  );

  const enroll = async (courseId: string) => {
    return dispatch(enrollInCourse(courseId));
  };

  const clearEnrollmentData = () => {
    dispatch(clearEnrollment());
  };

  return {
    enrollmentData,
    status,
    error,
    enroll,
    clearEnrollmentData,
    isLoading: status === "loading",
    isError: status === "failed",
    isSuccess: status === "succeeded",
  };
};
