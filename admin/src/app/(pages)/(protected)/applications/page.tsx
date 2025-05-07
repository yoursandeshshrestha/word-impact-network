"use client";

import React, { useEffect, useState } from "react";
import { useApplications } from "@/src/hooks/useApplication";
import ApplicationsList from "@/src/components/application/ApplicationsList";
import ApplicationDetails from "@/src/components/application/ApplicationDetails";
import RejectionModal from "@/src/components/application/RejectionModal";
import DeleteConfirmationModal from "@/src/components/application/DeleteConfirmationModal";
import Pagination from "@/src/components/application/Pagination";
import { Application } from "@/src/redux/features/applicationsSlice";
import { toast } from "sonner";

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
  } = useApplications();

  const [showDetails, setShowDetails] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadApplications(1);
  }, [
    loadApplications,
    updateStatus,
    removeApplication,
    selectApplication,
    applications,
  ]);

  const handlePageChange = (page: number) => {
    loadApplications(page);
  };

  const handleViewDetails = (application: Application) => {
    selectApplication(application);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    selectApplication(null);
  };

  const handleUpdateStatus = (status: "APPROVED" | "REJECTED" | "PENDING") => {
    if (!selectedApplication) return;

    if (status === "REJECTED") {
      setShowRejectionModal(true);
    } else {
      updateStatus({
        id: selectedApplication.applicationId,
        status,
      });
      setShowDetails(false);
      toast.success(`Application ${status.toLowerCase()} successfully`);
    }
  };

  const handleConfirmReject = (rejectionReason: string) => {
    if (!selectedApplication) return;

    updateStatus({
      id: selectedApplication.applicationId,
      status: "REJECTED",
      rejectionReason,
    });

    setShowRejectionModal(false);
    setShowDetails(false);
    toast.success("Application rejected successfully");
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedApplication) return;

    removeApplication(selectedApplication.applicationId);
    setShowDeleteModal(false);
    setShowDetails(false);
    toast.success("Application deleted successfully");
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

      {isLoading && !applications.length ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-500">Loading applications...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <ApplicationsList
            applications={applications}
            onViewDetails={handleViewDetails}
            isDisabled={showDetails}
          />

          {applications.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={pagination.current}
                totalPages={pagination.total}
                onPageChange={handlePageChange}
              />
            </div>
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
