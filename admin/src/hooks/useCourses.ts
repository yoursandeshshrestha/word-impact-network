import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  resetCourseStatus,
  setCourse,
  selectCourses,
  selectCourse,
  selectCoursesLoading,
  selectCoursesError,
  selectCoursesSuccess,
  selectCoursesMessage,
  Course,
} from "@/redux/features/coursesSlice";

export const useCourse = () => {
  const dispatch = useDispatch<AppDispatch>();
  const courses = useSelector(selectCourses);
  const course = useSelector(selectCourse);
  const loading = useSelector(selectCoursesLoading);
  const error = useSelector(selectCoursesError);
  const success = useSelector(selectCoursesSuccess);
  const message = useSelector(selectCoursesMessage);

  // Reset status when component unmounts or dependencies change
  useEffect(() => {
    return () => {
      dispatch(resetCourseStatus());
    };
  }, [dispatch]);

  const fetchCourses = () => {
    dispatch(getCourses());
  };

  const fetchCourseById = (id: string) => {
    dispatch(getCourseById(id));
  };

  const addCourse = (courseData: FormData) => {
    dispatch(createCourse(courseData));
  };

  const editCourse = (id: string, courseData: FormData) => {
    dispatch(updateCourse({ id, courseData }));
  };

  const removeCourse = (id: string) => {
    dispatch(deleteCourse(id));
  };

  const selectCourseData = (courseData: Course | null) => {
    dispatch(setCourse(courseData));
  };

  const reset = () => {
    dispatch(resetCourseStatus());
  };

  return {
    courses,
    course,
    loading,
    error,
    success,
    message,
    fetchCourses,
    fetchCourseById,
    addCourse,
    editCourse,
    removeCourse,
    selectCourse: selectCourseData,
    reset,
  };
};
