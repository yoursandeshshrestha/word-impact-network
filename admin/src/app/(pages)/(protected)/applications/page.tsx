"use client";
import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Filter,
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Download,
  FileText,
} from "lucide-react";
import { getAuthToken } from "@/src/utils/auth";
import { toast } from "sonner";
import ApplicationModal from "./ApplicationModal";

// Application data interface
interface ApplicationData {
  applicationId: string;
  email: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  country: string;
  academicQualification: string;
  desiredDegree: string;
  certificateUrl: string | null;
  recommendationLetterUrl: string | null;
  referredBy: string;
  referrerContact: string;
  agreesToTerms: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  appliedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  studentId: string | null;
  adminId: string | null;
  reviewedBy: string | null;
}

// Pagination data interface
interface PaginationData {
  current: number;
  limit: number;
  total: number;
  totalRecords: number;
}

// API response interface
interface ApiResponse {
  status: string;
  message: string;
  data: {
    applications: ApplicationData[];
    pagination: PaginationData;
  };
}

function Applications() {
  // State variables
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationData | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch applications on component mount and when filter/page changes
  useEffect(() => {
    fetchApplications(currentPage);
  }, [currentPage, filterStatus]);

  // Function to fetch applications from API
  const fetchApplications = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Build query parameters
      let url = `${process.env.NEXT_PUBLIC_API_URL}/applications?page=${page}&limit=${itemsPerPage}`;

      if (filterStatus !== "ALL") {
        url += `&status=${filterStatus}`;
      }

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching applications: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (result.status !== "success") {
        throw new Error(result.message || "Failed to fetch applications");
      }

      setApplications(result.data.applications);
      setCurrentPage(result.data.pagination.current);
      setTotalPages(result.data.pagination.total);
      setTotalRecords(result.data.pagination.totalRecords);
      setItemsPerPage(result.data.pagination.limit);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch applications"
      );
      toast.error("Failed to load applications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // View application details
  const viewApplicationDetails = async (id: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching application: ${response.status}`);
      }

      const result = await response.json();

      if (result.status !== "success") {
        throw new Error(
          result.message || "Failed to fetch application details"
        );
      }

      setSelectedApplication(result.data.application);
      setShowModal(true);
    } catch (err) {
      console.error(`Failed to fetch application ${id}:`, err);
      toast.error("Failed to load application details. Please try again.");
    }
  };

  // Handle application status update
  const updateApplicationStatus = async (
    id: string,
    status: "APPROVED" | "REJECTED" | "PENDING",
    rejectionReason?: string
  ) => {
    setIsUpdating(id);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const payload: { status: string; rejectionReason?: string } = { status };

      // Add rejection reason if provided and status is REJECTED
      if (status === "REJECTED" && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/update-status/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Error updating application: ${response.status}`
        );
      }

      const result = await response.json();

      if (result.status !== "success") {
        throw new Error(
          result.message || "Failed to update application status"
        );
      }

      // Update local state after successful API call
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app.applicationId === id ? { ...app, status } : app
        )
      );

      // Close modal if open
      if (showModal && selectedApplication?.applicationId === id) {
        setSelectedApplication(null);
        setShowModal(false);
      }

      toast.success(
        `Application ${
          status === "APPROVED"
            ? "approved"
            : status === "REJECTED"
            ? "rejected"
            : "reset to pending"
        } successfully`
      );
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update application status. Please try again."
      );
    } finally {
      setIsUpdating(null);
    }
  };

  // Handle application deletion
  const deleteApplication = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    setIsUpdating(id);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error deleting application: ${response.status}`);
      }

      const result = await response.json();

      if (result.status !== "success") {
        throw new Error(result.message || "Failed to delete application");
      }

      // Update local state after successful API call
      setApplications((prevApplications) =>
        prevApplications.filter((app) => app.applicationId !== id)
      );

      // Close modal if open
      if (showModal && selectedApplication?.applicationId === id) {
        setSelectedApplication(null);
        setShowModal(false);
      }

      toast.success("Application deleted successfully");
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to delete application. Please try again.");
    } finally {
      setIsUpdating(null);
    }
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications(1); // Reset to first page when searching
  };

  // Reset search filters
  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("ALL");
    fetchApplications(1);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Applications</h1>
        <div className="flex gap-2">
          <button
            onClick={resetFilters}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Filters
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Filter and search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Search by name, email, or degree..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              className="block w-full py-2 pl-3 pr-10 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors text-sm font-medium"
          >
            Search
          </button>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <ErrorAlert
          error={error}
          onRetry={() => fetchApplications(currentPage)}
        />
      )}

      {/* Applications table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <LoadingState />
        ) : applications.length === 0 ? (
          <EmptyState />
        ) : (
          <ApplicationsTable
            applications={applications}
            isUpdating={isUpdating}
            formatDate={formatDate}
            onViewDetails={viewApplicationDetails}
            onUpdateStatus={updateApplicationStatus}
            onDelete={deleteApplication}
          />
        )}

        {/* Pagination */}
        {!isLoading && applications.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Application Details Modal */}
      {showModal && selectedApplication && (
        <ApplicationModal
          application={selectedApplication}
          onClose={() => setShowModal(false)}
          onUpdateStatus={updateApplicationStatus}
          onDelete={deleteApplication}
        />
      )}
    </div>
  );
}

// Error Alert Component
const ErrorAlert = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 flex items-center">
    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
    <div className="flex-1">
      <p className="font-medium">Error loading applications</p>
      <p className="text-sm text-red-700">{error}</p>
    </div>
    <button
      onClick={onRetry}
      className="bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded text-sm font-medium transition-colors"
    >
      Retry
    </button>
  </div>
);

// Loading State Component
const LoadingState = () => (
  <div className="flex justify-center items-center py-16">
    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
    <span className="ml-2 text-gray-600">Loading applications...</span>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <div className="py-16 text-center">
    <p className="text-gray-500">
      No applications found matching your criteria.
    </p>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColors = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <span
      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColors(
        status
      )}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
};

// Applications Table Component
const ApplicationsTable = ({
  applications,
  isUpdating,
  formatDate,
  onViewDetails,
  onUpdateStatus,
  onDelete,
}: {
  applications: ApplicationData[];
  isUpdating: string | null;
  formatDate: (date: string) => string;
  onViewDetails: (id: string) => void;
  onUpdateStatus: (
    id: string,
    status: "APPROVED" | "REJECTED" | "PENDING",
    rejectionReason?: string
  ) => void;
  onDelete: (id: string) => void;
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Applicant
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Qualification
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Applied For
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Applied At
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Status
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {applications.map((application) => (
          <tr key={application.applicationId} className="hover:bg-gray-50">
            <td className="px-6 py-4">
              <div className="flex items-center">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {application.fullName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {application.email}
                  </div>
                  <div className="text-sm text-gray-500">
                    {application.phoneNumber} • {application.country}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm text-gray-900">
                {application.academicQualification}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm text-gray-900">
                {application.desiredDegree}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">
                {formatDate(application.appliedAt)}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <StatusBadge status={application.status} />
            </td>
            <td className="px-6 py-4 text-left text-sm font-medium">
              <ApplicationActions
                application={application}
                isUpdating={isUpdating}
                onViewDetails={onViewDetails}
                onUpdateStatus={onUpdateStatus}
                onDelete={onDelete}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Application Actions Component
const ApplicationActions = ({
  application,
  isUpdating,
  onViewDetails,
  onUpdateStatus,
  onDelete,
}: {
  application: ApplicationData;
  isUpdating: string | null;
  onViewDetails: (id: string) => void;
  onUpdateStatus: (
    id: string,
    status: "APPROVED" | "REJECTED" | "PENDING",
    rejectionReason?: string
  ) => void;
  onDelete: (id: string) => void;
}) => (
  <div className="flex space-x-2">
    <button
      onClick={() => onViewDetails(application.applicationId)}
      disabled={isUpdating === application.applicationId}
      className="text-blue-600 hover:text-blue-900 transition-colors"
      title="View Details"
    >
      <FileText className="h-5 w-5" />
    </button>

    {application.status === "PENDING" && (
      <>
        <button
          onClick={() => onUpdateStatus(application.applicationId, "APPROVED")}
          disabled={isUpdating === application.applicationId}
          className="text-green-600 hover:text-green-900 transition-colors"
          title="Approve Application"
        >
          {isUpdating === application.applicationId ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle className="h-5 w-5" />
          )}
        </button>
        <button
          onClick={() => {
            const reason = prompt("Please provide a reason for rejection:");
            if (reason) {
              onUpdateStatus(application.applicationId, "REJECTED", reason);
            }
          }}
          disabled={isUpdating === application.applicationId}
          className="text-red-600 hover:text-red-900 transition-colors"
          title="Reject Application"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </>
    )}

    <div className="relative group">
      <button className="text-gray-500 hover:text-gray-700">
        <MoreHorizontal className="h-5 w-5" />
      </button>
      <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        {application.status !== "PENDING" && (
          <button
            onClick={() => onUpdateStatus(application.applicationId, "PENDING")}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          >
            Reset to Pending
          </button>
        )}
        <button
          onClick={() => onDelete(application.applicationId)}
          className="block px-4 py-2 text-sm text-red-700 hover:bg-gray-100 w-full text-left"
        >
          Delete Application
        </button>
      </div>
    </div>
  </div>
);

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  totalRecords,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
    <div className="flex-1 flex justify-between sm:hidden">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        Previous
      </button>
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        Next
      </button>
    </div>
    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-medium">
            {totalRecords > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, totalRecords)}
          </span>{" "}
          of <span className="font-medium">{totalRecords}</span> results
        </p>
      </div>
      <div>
        <nav
          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
          aria-label="Pagination"
        >
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
              currentPage === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Generate page buttons intelligently */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === pageNum
                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
              currentPage === totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <span className="sr-only">Next</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </nav>
      </div>
    </div>
  </div>
);

export default Applications;
