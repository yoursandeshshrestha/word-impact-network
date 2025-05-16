"use client";

import React, { useEffect, useState } from "react";
import { useExam } from "@/hooks/useExam";
import { Question, Exam, NewQuestion } from "@/redux/features/examsSlice";
import ExamModal from "@/components/exams/ExamModel";
import QuestionModal from "@/components/exams/QuestionModel";
import QuestionCard from "@/components/exams/QuestionCard";
import DeleteQuestionModal from "@/components/exams/DeleteQuestionModel";
import Loading from "@/components/common/Loading";
import NoDataFound from "@/components/common/NoDataFound";
import { toast } from "sonner";
import {
  ArrowLeft,
  Award,
  Edit,
  Clock,
  HelpCircle,
  BarChart,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";

// Define the params type with the properties we need
type ExamPageParams = {
  id: string; // courseId
  chapterId: string;
  examId: string;
};

// Define the proper page props interface for pages protected by middleware
interface PageProps {
  params: Promise<ExamPageParams>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function ExamManagementPage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<ExamPageParams | null>(
    null
  );

  const {
    exam,
    questions,
    loading,
    error,
    success,
    message,
    fetchExamById,
    editExam,
    addNewQuestion,
    editQuestion,
    removeQuestion,
    reset,
  } = useExam();

  const [isEditExamModalOpen, setIsEditExamModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isDeleteQuestionModalOpen, setIsDeleteQuestionModalOpen] =
    useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<{
    id: string;
    text: string;
  } | null>(null);

  // Track if exam has been fetched
  const [examFetched, setExamFetched] = useState(false);

  // Resolve the params promise
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Fetch exam data once params are resolved - ONLY once
  useEffect(() => {
    if (resolvedParams && !examFetched) {
      fetchExamById(resolvedParams.examId);
      setExamFetched(true);
    }
  }, [resolvedParams, fetchExamById, examFetched]);

  // Handle success and error states
  useEffect(() => {
    if (success && message) {
      toast.success(message);

      // Close modals
      setIsEditExamModalOpen(false);
      setIsQuestionModalOpen(false);
      setIsDeleteQuestionModalOpen(false);
      setQuestionToEdit(null);
      setQuestionToDelete(null);

      // Reset status in Redux
      reset();

      // Refresh exam data
      if (resolvedParams) {
        fetchExamById(resolvedParams.examId);
      }
    }

    if (error) {
      toast.error(error);
      reset();
    }
  }, [success, message, error, reset, resolvedParams, fetchExamById]);

  if (!resolvedParams || (loading && !exam)) {
    return <Loading />;
  }

  if (error || !exam) {
    return (
      <NoDataFound message="Exam not found or you don't have access to it." />
    );
  }

  const { id: courseId, chapterId, examId } = resolvedParams;

  const handleEditExam = (examData: Exam) => {
    if (exam) {
      editExam(examId, examData);
    }
  };

  const handleAddQuestion = (questionData: NewQuestion) => {
    addNewQuestion(examId, questionData);
  };

  const handleEditQuestion = (questionData: Question) => {
    if (questionToEdit) {
      editQuestion(examId, questionToEdit.id, questionData);
    }
  };

  const handleDeleteQuestion = () => {
    if (questionToDelete) {
      removeQuestion(examId, questionToDelete.id);
    }
  };

  const openQuestionModal = (question?: Question) => {
    if (question) {
      setQuestionToEdit(question);
    } else {
      setQuestionToEdit(null);
    }
    setIsQuestionModalOpen(true);
  };

  const openDeleteQuestionModal = (id: string) => {
    const question = questions.find((q) => q.id === id);
    if (question) {
      setQuestionToDelete({ id, text: question.text });
      setIsDeleteQuestionModalOpen(true);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href={`/courses/${courseId}/chapters/${chapterId}`}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors duration-200 cursor-pointer"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Chapter
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <Award size={24} className="mr-2 text-indigo-600" />
                {exam.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Clock size={12} className="mr-1" />
                  {exam.timeLimit
                    ? `${exam.timeLimit} minutes`
                    : "No time limit"}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <BarChart size={12} className="mr-1" />
                  Passing Score: {exam.passingScore}%
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <HelpCircle size={12} className="mr-1" />
                  {questions.length} Question{questions.length !== 1 ? "s" : ""}
                </span>
              </div>

              {exam.description && (
                <p className="text-gray-600 mb-4">{exam.description}</p>
              )}
            </div>

            <div className="flex md:flex-col gap-2">
              <button
                onClick={() => setIsEditExamModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors duration-200"
              >
                <Edit size={16} className="mr-2" />
                Edit Exam
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <HelpCircle size={20} className="mr-2 text-indigo-600" />
          Questions
        </h2>
        <button
          onClick={() => openQuestionModal()}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors duration-200"
        >
          <PlusCircle size={16} className="mr-2" />
          Add Question
        </button>
      </div>

      {loading && <Loading />}

      {!loading && questions.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <HelpCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Questions Added Yet
          </h3>
          <p className="text-gray-500 mb-4">
            Start adding questions to your exam.
          </p>
          <button
            onClick={() => openQuestionModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors duration-200"
          >
            <PlusCircle size={16} className="mr-2" />
            Add Your First Question
          </button>
        </div>
      ) : (
        !loading && (
          <div className="grid grid-cols-1 gap-4">
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                questionNumber={index + 1}
                onEdit={() => openQuestionModal(question)}
                onDelete={openDeleteQuestionModal}
              />
            ))}
          </div>
        )
      )}

      {/* Edit Exam Modal */}
      <ExamModal
        isOpen={isEditExamModalOpen}
        onClose={() => setIsEditExamModalOpen(false)}
        onSubmit={handleEditExam}
        initialData={
          exam
            ? {
                title: exam.title,
                description: exam.description || "",
                passingScore: exam.passingScore,
                timeLimit: exam.timeLimit || 60,
              }
            : null
        }
        isLoading={loading}
        mode="edit"
      />

      {/* Question Modal (Add/Edit) */}
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setQuestionToEdit(null);
        }}
        onSubmit={questionToEdit ? handleEditQuestion : handleAddQuestion}
        initialData={
          questionToEdit
            ? {
                text: questionToEdit.text,
                questionType: questionToEdit.questionType,
                options: questionToEdit.options,
                correctAnswer: questionToEdit.correctAnswer,
                points: questionToEdit.points,
              }
            : null
        }
        isLoading={loading}
        mode={questionToEdit ? "edit" : "create"}
      />

      {/* Delete Question Modal */}
      <DeleteQuestionModal
        isOpen={isDeleteQuestionModalOpen}
        onClose={() => setIsDeleteQuestionModalOpen(false)}
        onConfirm={handleDeleteQuestion}
        questionText={questionToDelete?.text || ""}
        isLoading={loading}
      />
    </div>
  );
}
