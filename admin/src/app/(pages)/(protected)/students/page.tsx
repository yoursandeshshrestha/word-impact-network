"use client";

import React, { useState } from "react";
import { useStudents } from "@/src/hooks/useStudent";
import StudentsList from "@/src/components/students/StudentsList";
import StudentDetails from "@/src/components/students/StudentDetails";
import SearchBar from "@/src/components/students/SearchBar";
import { Student } from "@/src/redux/features/studentsSlice";
import NoDataFound from "@/src/components/common/NoDataFound";
import Loading from "@/src/components/common/Loading";
import Pagination from "@/src/components/common/Pagination";
import PaginationControls from "@/src/components/common/PaginationControls";

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
  } = useStudents();

  const [showDetails, setShowDetails] = useState(false);

  const handleViewDetails = (student: Student) => {
    selectStudent(student);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    selectStudent(null);
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
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          Error: {error}
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
