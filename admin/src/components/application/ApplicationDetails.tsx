import React from "react";
import { Application } from "@/src/redux/features/applicationsSlice";
import { formatDate } from "@/src/utils/formatters";
import { X } from "lucide-react";

interface ApplicationDetailsProps {
  application: Application;
  onUpdateStatus: (status: "APPROVED" | "REJECTED" | "PENDING") => void;
  onDelete: () => void;
  onClose: () => void;
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({
  application,
  onUpdateStatus,
  onDelete,
  onClose,
}) => {
  // Ensure application is a valid object
  if (!application || typeof application !== "object") {
    return <div>Invalid application data</div>;
  }

  // Safe string access function to prevent rendering objects directly
  const safeString = (value: string | null | undefined): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "string") return value;
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  // Check if the application is in a reviewed state (approved or rejected)
  const isReviewed =
    application.status === "APPROVED" || application.status === "REJECTED";

  return (
    <div className="fixed inset-0 bg-black/50 px-4 lg:px-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Application Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 cursor-pointer hover:text-gray-500 transition-colors duration-150"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 flex items-center">
            <span
              className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                application.status === "APPROVED"
                  ? "bg-green-100 text-green-800"
                  : application.status === "REJECTED"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {safeString(application.status)}
            </span>
            {application.reviewedAt && (
              <span className="text-sm text-gray-500 ml-3">
                Reviewed on {formatDate(application.reviewedAt)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500">
                Personal Information
              </h3>
              <div className="space-y-3">
                <p className="text-sm">
                  <span className="font-medium text-gray-900">Full Name:</span>{" "}
                  <span className="text-gray-600">
                    {safeString(application.fullName)}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-900">Email:</span>{" "}
                  <span className="text-gray-600">
                    {safeString(application.email)}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-900">Gender:</span>{" "}
                  <span className="text-gray-600">
                    {safeString(application.gender)}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-900">
                    Date of Birth:
                  </span>{" "}
                  <span className="text-gray-600">
                    {formatDate(application.dateOfBirth)}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-900">
                    Phone Number:
                  </span>{" "}
                  <span className="text-gray-600">
                    {safeString(application.phoneNumber)}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-900">Country:</span>{" "}
                  <span className="text-gray-600">
                    {safeString(application.country)}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500">
                Academic Information
              </h3>
              <div className="space-y-3">
                <p className="text-sm">
                  <span className="font-medium text-gray-900">
                    Academic Qualification:
                  </span>{" "}
                  <span className="text-gray-600">
                    {safeString(application.academicQualification)}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-900">
                    Desired Degree:
                  </span>{" "}
                  <span className="text-gray-600">
                    {safeString(application.desiredDegree)}
                  </span>
                </p>

                {application.certificateUrl && (
                  <p className="text-sm">
                    <span className="font-medium text-gray-900">
                      Certificate:
                    </span>{" "}
                    <a
                      href={safeString(application.certificateUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      View Certificate
                    </a>
                  </p>
                )}

                {application.recommendationLetterUrl && (
                  <p className="text-sm">
                    <span className="font-medium text-gray-900">
                      Recommendation Letter:
                    </span>{" "}
                    <a
                      href={safeString(application.recommendationLetterUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      View Letter
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>

          {application.referredBy && (
            <div className="mb-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-500">
                Referral Information
              </h3>
              <div className="space-y-3">
                <p className="text-sm">
                  <span className="font-medium text-gray-900">
                    Referred By:
                  </span>{" "}
                  <span className="text-gray-600">
                    {safeString(application.referredBy)}
                  </span>
                </p>
                {application.referrerContact && (
                  <p className="text-sm">
                    <span className="font-medium text-gray-900">
                      Referrer Contact:
                    </span>{" "}
                    <span className="text-gray-600">
                      {safeString(application.referrerContact)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {application.rejectionReason && (
            <div className="mb-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-500">
                Rejection Reason
              </h3>
              <div className="bg-red-50 border border-red-100 rounded-md p-4">
                <p className="text-sm text-red-700">
                  {safeString(application.rejectionReason)}
                </p>
              </div>
            </div>
          )}

          <div className="mb-6 space-y-4">
            <h3 className="text-sm font-medium text-gray-500">
              Application Timeline
            </h3>
            <div className="space-y-3">
              <p className="text-sm">
                <span className="font-medium text-gray-900">Applied At:</span>{" "}
                <span className="text-gray-600">
                  {formatDate(application.appliedAt)}
                </span>
              </p>

              {application.reviewedAt && (
                <p className="text-sm">
                  <span className="font-medium text-gray-900">
                    Reviewed At:
                  </span>{" "}
                  <span className="text-gray-600">
                    {formatDate(application.reviewedAt)}
                  </span>
                </p>
              )}

              {application.reviewedBy && (
                <p className="text-sm">
                  <span className="font-medium text-gray-900">
                    Reviewed By:
                  </span>{" "}
                  <span className="text-gray-600">
                    {typeof application.reviewedBy === "object"
                      ? application.reviewedBy.fullName
                      : application.reviewedBy}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            {/* Only show action buttons if the application hasn't been reviewed yet */}
            {!isReviewed && (
              <>
                <button
                  onClick={() => onUpdateStatus("APPROVED")}
                  className="inline-flex cursor-pointer items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                >
                  Approve
                </button>
                <button
                  onClick={() => onUpdateStatus("REJECTED")}
                  className="inline-flex cursor-pointer items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                >
                  Reject
                </button>
              </>
            )}

            {/* Always show the delete button */}
            <button
              onClick={onDelete}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
