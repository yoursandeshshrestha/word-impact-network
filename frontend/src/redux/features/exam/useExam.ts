import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchExamData, startExam, submitExam, clearExam } from "./examSlice";

export const useExam = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { examData, currentAttempt, status, error } = useSelector(
    (state: RootState) => state.exam
  );

  const loadExamData = (
    courseId: string,
    chapterId: string,
    examId: string
  ) => {
    dispatch(fetchExamData({ courseId, chapterId, examId }));
  };

  const startExamAttempt = (
    courseId: string,
    chapterId: string,
    examId: string
  ) => {
    dispatch(startExam({ courseId, chapterId, examId }));
  };

  const submitExamAttempt = async (
    courseId: string,
    chapterId: string,
    examId: string,
    attemptId: string,
    answers: { questionId: string; answer: string }[]
  ) => {
    const result = await dispatch(
      submitExam({
        courseId,
        chapterId,
        examId,
        attemptId,
        answers,
      })
    ).unwrap();

    return result;
  };

  const resetExam = () => {
    dispatch(clearExam());
  };

  return {
    examData,
    currentAttempt,
    status,
    error,
    isLoading: status === "loading",
    isError: status === "failed",
    loadExamData,
    startExamAttempt,
    submitExamAttempt,
    resetExam,
  };
};
