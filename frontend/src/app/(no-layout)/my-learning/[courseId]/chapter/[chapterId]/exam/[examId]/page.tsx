"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useExam } from "@/redux/features/exam/useExam";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowLeft,
} from "lucide-react";

type ExamQuestion = { points?: number };

function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const { courseId, chapterId, examId } = params;
  const {
    examData,
    currentAttempt,
    loadExamData,
    startExamAttempt,
    submitExamAttempt,
    isLoading,
    isError,
  } = useExam();

  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [examResult, setExamResult] = useState<{
    score: number;
    isPassed: boolean;
    totalQuestions: number;
    correctAnswers: number;
    passingScore: number;
    totalPoints: number;
    earnedPoints: number;
    pointsNeededToPass: number;
  } | null>(null);

  useEffect(() => {
    if (courseId && chapterId && examId) {
      loadExamData(courseId as string, chapterId as string, examId as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, chapterId, examId]);

  useEffect(() => {
    if (currentAttempt) {
      const endTime = new Date(currentAttempt.endTime).getTime();
      const startTime = new Date(currentAttempt.startTime).getTime();
      const duration = endTime - startTime;
      setTimeLeft(Math.floor(duration / 1000));

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAttempt]);

  const handleStartExam = () => {
    if (courseId && chapterId && examId) {
      startExamAttempt(
        courseId as string,
        chapterId as string,
        examId as string
      );
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = () => {
    if (!currentAttempt) return;

    const formattedAnswers = Object.entries(answers).map(
      ([questionId, answer]) => ({
        questionId,
        answer,
      })
    );

    if (courseId && chapterId && examId) {
      submitExamAttempt(
        courseId as string,
        chapterId as string,
        examId as string,
        currentAttempt.attemptId,
        formattedAnswers
      ).then((result) => {
        if (result && examData?.exam) {
          const passingScore = result.passingScore || 70;
          const totalPoints = result.totalPossiblePoints || 1;
          const earnedPoints = result.score || 0;
          const scorePercentage =
            result.results?.percentage ??
            Math.round((earnedPoints / totalPoints) * 100);
          const pointsNeededToPass = Math.ceil(
            (passingScore / 100) * totalPoints
          );
          const isPassed = result.isPassed;
          const correctAnswers = result.results?.correctAnswers ?? earnedPoints;
          const totalQuestions =
            result.results?.totalQuestions ?? currentAttempt.totalQuestions;

          setExamResult({
            score: scorePercentage,
            isPassed,
            totalQuestions,
            correctAnswers,
            passingScore,
            totalPoints,
            earnedPoints,
            pointsNeededToPass,
          });
        }
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleBackToChapter = () => {
    router.push(`/my-learning/${courseId}/chapter/${chapterId}`);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-500 flex items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          <span>Error loading exam. Please try again.</span>
        </div>
      </div>
    );
  }

  if (!examData) {
    return null;
  }

  if (examResult) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col md:flex-row gap-8 px-0 md:px-8 pt-20">
        {/* Main Content */}
        <div className="flex-1 max-w-3xl mx-auto md:mx-0">
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-md">
            <div className="text-center mb-8">
              {examResult.isPassed ? (
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-4">
                  <Trophy className="w-10 h-10 text-green-600" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-4">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
              )}
              <h1 className="text-3xl font-bold text-slate-900 mb-2 whitespace-nowrap">
                {examResult.isPassed ? "Congratulations!" : "Not Passed"}
              </h1>
              <p className="text-slate-600 whitespace-nowrap">
                {examResult.isPassed
                  ? "You have successfully passed the exam."
                  : `You need at least ${examResult.pointsNeededToPass} point${
                      examResult.pointsNeededToPass !== 1 ? "s" : ""
                    } to pass (${examResult.passingScore}% of ${
                      examResult.totalPoints
                    } total point${examResult.totalPoints !== 1 ? "s" : ""}).`}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Trophy className="w-5 h-5 text-blue-600" />
                  <span className="font-medium whitespace-nowrap">
                    Your Score
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 whitespace-nowrap">
                  {examResult.score}%
                </p>
                <p className="text-sm text-slate-500 mt-1 whitespace-nowrap">
                  {examResult.earnedPoints} / {examResult.totalPoints} point
                  {examResult.totalPoints !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium whitespace-nowrap">
                    Correct Answers
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 whitespace-nowrap">
                  {examResult.correctAnswers}/{examResult.totalQuestions}
                </p>
                <p className="text-sm text-slate-500 mt-1 whitespace-nowrap">
                  {Math.round(
                    (examResult.correctAnswers / examResult.totalQuestions) *
                      100
                  )}
                  % accuracy
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium whitespace-nowrap">
                    Passing Score
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 whitespace-nowrap">
                  {examResult.passingScore}%
                </p>
                <p className="text-sm text-slate-500 mt-1 whitespace-nowrap">
                  {examResult.pointsNeededToPass} point
                  {examResult.pointsNeededToPass !== 1 ? "s" : ""} needed
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-medium whitespace-nowrap">
                    Time Taken
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 whitespace-nowrap">
                  {formatTime(
                    examData.exam?.timeLimit
                      ? examData.exam.timeLimit * 60 - timeLeft
                      : 0
                  )}
                </p>
                <p className="text-sm text-slate-500 mt-1 whitespace-nowrap">
                  of {examData.exam?.timeLimit || "∞"} minutes
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleBackToChapter}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Chapter
              </button>
            </div>
          </div>
        </div>
        {/* Sidebar: Previous Attempts */}
        <aside className="w-full md:w-96 flex-shrink-0">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2 whitespace-nowrap">
              Previous Attempts
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {examData.attempts && examData.attempts.length > 0 ? (
                examData.attempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200"
                  >
                    <div>
                      <p className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(attempt.startTime).toLocaleDateString()}
                      </p>
                      <p className="font-medium text-slate-900 whitespace-nowrap">
                        Score: {attempt.score}%
                      </p>
                    </div>
                    {attempt.isPassed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm whitespace-nowrap">
                  No previous attempts.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    );
  }

  if (!currentAttempt) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col md:flex-row gap-8 px-0 md:px-8 pt-20">
        {/* Main Content */}
        <div className="flex-1 max-w-3xl mx-auto md:mx-0">
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-md">
            <h1 className="text-3xl font-bold text-slate-900 mb-4 whitespace-nowrap">
              {examData.exam?.title}
            </h1>
            <p className="text-slate-600 mb-6 whitespace-nowrap">
              {examData.exam?.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-medium whitespace-nowrap">
                    Time Limit
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 whitespace-nowrap">
                  {examData.exam?.timeLimit} minutes
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <span className="font-medium whitespace-nowrap">
                    Passing Score
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 whitespace-nowrap">
                  {examData.exam?.passingScore}%
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Trophy className="min-w-5 min-h-5 text-blue-600" />
                  <span className="font-medium whitespace-nowrap">
                    Total Questions
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 whitespace-nowrap">
                  {examData.exam?.totalQuestions ||
                    (Array.isArray(
                      (examData.exam as { questions?: ExamQuestion[] })
                        ?.questions
                    )
                      ? (examData.exam as { questions?: ExamQuestion[] })
                          .questions?.length ?? 0
                      : 0)}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Trophy className="w-5 h-5 text-blue-600" />
                  <span className="font-medium whitespace-nowrap">
                    Total Points
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 whitespace-nowrap">
                  {examData.exam?.totalPoints ||
                    (Array.isArray(
                      (examData.exam as { questions?: ExamQuestion[] })
                        ?.questions
                    )
                      ? (
                          examData.exam as { questions?: ExamQuestion[] }
                        ).questions?.reduce(
                          (sum, q) => sum + (q.points || 1),
                          0
                        ) ?? 0
                      : 0)}
                </p>
              </div>
            </div>

            <button
              onClick={handleStartExam}
              disabled={!examData.progress?.canTakeExam}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-colors duration-200 text-lg mt-4 ${
                examData.progress?.canTakeExam
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-slate-300 cursor-not-allowed"
              } whitespace-nowrap`}
            >
              {examData.progress?.canTakeExam
                ? "Start Exam"
                : "Complete Prerequisites"}
            </button>
          </div>
        </div>
        {/* Sidebar: Previous Attempts */}
        <aside className="w-full md:w-96 flex-shrink-0">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2 whitespace-nowrap">
              Previous Attempts
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {examData.attempts && examData.attempts.length > 0 ? (
                examData.attempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200"
                  >
                    <div>
                      <p className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(attempt.startTime).toLocaleDateString()}
                      </p>
                      <p className="font-medium text-slate-900 whitespace-nowrap">
                        Score: {attempt.score}%
                      </p>
                    </div>
                    {attempt.isPassed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm whitespace-nowrap">
                  No previous attempts.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-auto px-5 pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-900 whitespace-nowrap">
              {currentAttempt.title}
            </h1>
            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5" />
              <span className="font-medium whitespace-nowrap">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="space-y-8">
            {currentAttempt.questions.map((question, index) => (
              <div key={question.id} className="border-b border-slate-200 pb-8">
                <div className="flex items-start gap-4">
                  <span className="bg-blue-100 text-blue-600 font-medium px-3 py-1 rounded-lg">
                    Question {index + 1}
                  </span>
                  <span className="text-slate-600 whitespace-nowrap">
                    ({question.points} points)
                  </span>
                </div>
                <p className="text-lg font-medium text-slate-900 mt-4 mb-4 whitespace-nowrap">
                  {question.text}
                </p>
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) =>
                          handleAnswerChange(question.id, e.target.value)
                        }
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="text-slate-900 whitespace-nowrap">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50  z-101 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 whitespace-nowrap">
              Confirm Submission
            </h2>
            <p className="text-slate-600 mb-6 ">
              Are you sure you want to submit your exam? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors duration-200 whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmSubmit(false);
                  handleSubmit();
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamPage;
