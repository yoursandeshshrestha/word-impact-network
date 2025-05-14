import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  createExam,
  getExamById,
  updateExam,
  deleteExam,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  resetExamStatus,
  setExam,
  setQuestion,
  clearExam,
  selectExams,
  selectExam,
  selectQuestions,
  selectQuestion,
  selectExamsLoading,
  selectExamsError,
  selectExamsSuccess,
  selectExamsMessage,
  Exam,
  Question,
  NewQuestion,
} from "@/redux/features/examsSlice";

export const useExam = () => {
  const dispatch = useDispatch<AppDispatch>();
  const exams = useSelector(selectExams);
  const exam = useSelector(selectExam);
  const questions = useSelector(selectQuestions);
  const question = useSelector(selectQuestion);
  const loading = useSelector(selectExamsLoading);
  const error = useSelector(selectExamsError);
  const success = useSelector(selectExamsSuccess);
  const message = useSelector(selectExamsMessage);

  // Reset status when component unmounts or dependencies change
  useEffect(() => {
    return () => {
      dispatch(resetExamStatus());
    };
  }, [dispatch]);

  const fetchExamById = (id: string) => {
    dispatch(getExamById(id));
  };

  const createNewExam = (
    chapterId: string,
    examData: Omit<
      Exam,
      "id" | "adminId" | "chapterId" | "createdAt" | "updatedAt"
    >
  ) => {
    dispatch(createExam({ chapterId, examData }));
  };

  const editExam = (id: string, examData: Partial<Exam>) => {
    dispatch(updateExam({ id, examData }));
  };

  const removeExam = (id: string) => {
    dispatch(deleteExam(id));
  };

  const addNewQuestion = (examId: string, questionData: NewQuestion) => {
    dispatch(addQuestion({ examId, questionData }));
  };

  const editQuestion = (
    examId: string,
    questionId: string,
    questionData: Partial<NewQuestion>
  ) => {
    dispatch(updateQuestion({ examId, questionId, questionData }));
  };

  const removeQuestion = (examId: string, questionId: string) => {
    dispatch(deleteQuestion({ examId, questionId }));
  };

  const selectExamData = (examData: Exam | null) => {
    dispatch(setExam(examData));
  };

  const selectQuestionData = (questionData: Question | null) => {
    dispatch(setQuestion(questionData));
  };

  const reset = () => {
    dispatch(resetExamStatus());
  };

  const clearExamData = () => {
    dispatch(clearExam());
  };

  return {
    exams,
    exam,
    questions,
    question,
    loading,
    error,
    success,
    message,
    fetchExamById,
    createNewExam,
    editExam,
    removeExam,
    addNewQuestion,
    editQuestion,
    removeQuestion,
    selectExam: selectExamData,
    selectQuestion: selectQuestionData,
    reset,
    clearExamData,
  };
};
