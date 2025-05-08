"use client";

import React, { useEffect, useState } from "react";
import { useApplications } from "@/src/hooks/useApplication";
import ApplicationsList from "@/src/components/application/ApplicationsList";
import ApplicationDetails from "@/src/components/application/ApplicationDetails";
import RejectionModal from "@/src/components/application/RejectionModal";
import DeleteConfirmationModal from "@/src/components/application/DeleteConfirmationModal";
import Pagination from "@/src/components/common/Pagination";
import PaginationControls from "@/src/components/common/PaginationControls";
import { Application } from "@/src/redux/features/applicationsSlice";
import { toast } from "sonner";
import NoDataFound from "@/src/components/common/NoDataFound";
import Loading from "@/src/components/common/Loading";

const Page: React.FC = () => {
  const {
    applications,
    pagination,
    selectedApplication,
    isLoading,
    error,
    loadApplications,
    updateStatus,
    removeApplication,
    selectApplication,
    changeLimit,
  } = useApplications();

  const [showDetails, setShowDetails] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [localApplications, setLocalApplications] = useState<Application[]>([]);

  useEffect(() => {
    loadApplications(1);
  }, [loadApplications]);

  // Update local applications state when applications from the hook changes
  useEffect(() => {
    setLocalApplications(applications);
  }, [applications]);

  const handlePageChange = (page: number) => {
    loadApplications(page, pagination.limit);
  };

  const handleLimitChange = (limit: number) => {
    changeLimit(limit);
  };

  const handleViewDetails = (application: Application) => {
    selectApplication(application);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    selectApplication(null);
  };

  // Helper to update application status locally
  const updateLocalApplicationStatus = (
    id: string,
    status: string,
    rejectionReason?: string
  ) => {
    setLocalApplications((prevApps) =>
      prevApps.map((app) =>
        app.applicationId === id
          ? {
              ...app,
              status: status as "APPROVED" | "REJECTED" | "PENDING",
              rejectionReason: rejectionReason || app.rejectionReason,
            }
          : app
      )
    );
  };

  const handleUpdateStatus = (status: "APPROVED" | "REJECTED" | "PENDING") => {
    if (!selectedApplication) return;

    if (status === "REJECTED") {
      setShowRejectionModal(true);
    } else {
      // Immediately update UI and close modal
      updateLocalApplicationStatus(selectedApplication.applicationId, status);
      setShowDetails(false);

      // Show loading toast that will be replaced with success/error
      const toastId = toast.loading("Updating application status...");

      // Make API call in background
      updateStatus({
        id: selectedApplication.applicationId,
        status,
      })
        .then(() => {
          // Update toast on success
          toast.success(`Application ${status.toLowerCase()} successfully`, {
            id: toastId,
          });
          // Refresh data
          loadApplications(pagination.current, pagination.limit);
        })
        .catch((error) => {
          console.error("Failed to update status:", error);
          toast.error("Failed to update application status", { id: toastId });
          // Revert the local state change on error
          loadApplications(pagination.current, pagination.limit);
        });
    }
  };

  const handleConfirmReject = (rejectionReason: string) => {
    if (!selectedApplication) return;

    // Immediately update UI and close modals
    updateLocalApplicationStatus(
      selectedApplication.applicationId,
      "REJECTED",
      rejectionReason
    );
    setShowRejectionModal(false);
    setShowDetails(false);

    // Show loading toast that will be replaced with success/error
    const toastId = toast.loading("Rejecting application...");

    // Make API call in background
    updateStatus({
      id: selectedApplication.applicationId,
      status: "REJECTED",
      rejectionReason,
    })
      .then(() => {
        // Update toast on success
        toast.success("Application rejected successfully", { id: toastId });
        // Refresh data
        loadApplications(pagination.current, pagination.limit);
      })
      .catch((error) => {
        console.error("Failed to reject application:", error);
        toast.error("Failed to reject application", { id: toastId });
        // Revert the local state change on error
        loadApplications(pagination.current, pagination.limit);
      });
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedApplication) return;

    // Immediately update UI and close modals
    setLocalApplications((prevApps) =>
      prevApps.filter(
        (app) => app.applicationId !== selectedApplication.applicationId
      )
    );
    setShowDeleteModal(false);
    setShowDetails(false);

    // Show loading toast that will be replaced with success/error
    const toastId = toast.loading("Deleting application...");

    // Make API call in background
    removeApplication(selectedApplication.applicationId)
      .then(() => {
        // Update toast on success
        toast.success("Application deleted successfully", { id: toastId });
        // Refresh data
        loadApplications(pagination.current, pagination.limit);
      })
      .catch((error) => {
        console.error("Failed to delete application:", error);
        toast.error("Failed to delete application", { id: toastId });
        // Revert the local state change on error
        loadApplications(pagination.current, pagination.limit);
      });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Applications</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          Error: {error}
        </div>
      )}

      {isLoading ? (
        <Loading />
      ) : localApplications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <NoDataFound
            icon="file"
            title="No Applications Found"
            message="There are no applications to display at the moment."
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <ApplicationsList
            applications={localApplications}
            onViewDetails={handleViewDetails}
            isDisabled={showDetails}
          />

          {localApplications.length > 0 && (
            <>
              <PaginationControls
                total={pagination.total}
                currentCount={localApplications.length}
                limit={pagination.limit || 10}
                onLimitChange={handleLimitChange}
              />
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={pagination.current}
                  totalPages={pagination.total}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>
      )}

      {showDetails && selectedApplication && (
        <ApplicationDetails
          application={selectedApplication}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteClick}
          onClose={handleCloseDetails}
        />
      )}

      {/* Modals */}
      {selectedApplication && (
        <>
          <RejectionModal
            isOpen={showRejectionModal}
            onClose={() => setShowRejectionModal(false)}
            onConfirm={handleConfirmReject}
          />

          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleConfirmDelete}
            applicationName={selectedApplication.fullName}
          />
        </>
      )}
    </div>
  );
};

export default Page;
