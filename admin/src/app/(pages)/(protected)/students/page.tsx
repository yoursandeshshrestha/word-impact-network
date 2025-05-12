"use client";

import React, { useState, useEffect } from "react";
import { useStudents } from "@/hooks/useStudent";
import StudentsList from "@/components/students/StudentsList";
import StudentDetails from "@/components/students/StudentDetails";
import SearchBar from "@/components/students/SearchBar";
import { Student } from "@/redux/features/studentsSlice";
import NoDataFound from "@/components/common/NoDataFound";
import Loading from "@/components/common/Loading";
import Pagination from "@/components/common/Pagination";
import PaginationControls from "@/components/common/PaginationControls";

const StudentsPage: React.FC = () => {
  const {
    students,
    selectedStudent,
    isLoading,
    error,
    searchQuery,
    pagination,
    updateSearchQuery,
    selectStudent,
    changePage,
    changeLimit,
    loadStudents,
  } = useStudents();

  const [showDetails, setShowDetails] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (error && retryCount < 3) {
      const timer = setTimeout(() => {
        loadStudents();
        setRetryCount((prev) => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, loadStudents]);

  useEffect(() => {
    if (!error) {
      setRetryCount(0);
    }
  }, [error]);

  const handleViewDetails = (student: Student) => {
    selectStudent(student);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    selectStudent(null);
  };

  const handleRetry = () => {
    setRetryCount(0);
    loadStudents();
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
        <div className="w-full md:w-96">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={updateSearchQuery}
            isLoading={isLoading}
            placeholder="Search by name, email, or phone..."
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex justify-between items-center">
          <span>Error: {error}</span>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${showDetails ? "md:col-span-2" : "md:col-span-3"}`}>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {isLoading && !students.length ? (
              <Loading />
            ) : students.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <NoDataFound
                  icon="file"
                  title="No Students Found"
                  message="There are no students to display at the moment."
                />
              </div>
            ) : (
              <>
                <StudentsList
                  students={students}
                  onViewDetails={handleViewDetails}
                />

                <PaginationControls
                  total={pagination.total}
                  currentCount={students.length}
                  limit={pagination.limit}
                  onLimitChange={changeLimit}
                />

                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={changePage}
                />
              </>
            )}
          </div>
        </div>

        {showDetails && selectedStudent && (
          <div className="md:col-span-1">
            <StudentDetails
              student={selectedStudent}
              onClose={handleCloseDetails}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
