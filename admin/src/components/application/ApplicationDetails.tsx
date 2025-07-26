import React from "react";
import { Application } from "@/redux/features/applicationsSlice";
import { formatDate } from "@/utils/formatters";
import ResponsiveModal from "@/components/common/ResponsiveModal";
import {
  CreditCard,
  IndianRupee,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface ApplicationDetailsProps {
  application: Application;
  onUpdateStatus: (applicationId: string, status: string) => void;
  onDelete: (applicationId: string) => void;
  onClose: () => void;
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({
  application,
  onUpdateStatus,
  onDelete,
  onClose,
}) => {
  const safeString = (value: string | null | undefined) => {
    return value || "Not provided";
  };

  const handleStatusUpdate = (status: string) => {
    onUpdateStatus(application.applicationId, status);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      onDelete(application.applicationId);
      onClose();
    }
  };

  return (
    <ResponsiveModal
      isOpen={true}
      onClose={onClose}
      title="Application Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Status and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
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
              <span className="text-sm text-gray-500">
                Reviewed on {formatDate(application.reviewedAt)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {application.status === "PENDING" && (
              <>
                <button
                  onClick={() => handleStatusUpdate("APPROVED")}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate("REJECTED")}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
              </>
            )}
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Application Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 border-b border-gray-200 pb-2">
              Personal Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-900">Full Name:</span>
                <p className="text-gray-600">
                  {safeString(application.fullName)}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Email:</span>
                <p className="text-gray-600">{safeString(application.email)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Gender:</span>
                <p className="text-gray-600">
                  {safeString(application.gender)}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">
                  Date of Birth:
                </span>
                <p className="text-gray-600">
                  {formatDate(application.dateOfBirth)}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Phone Number:</span>
                <p className="text-gray-600">
                  {safeString(application.phoneNumber)}
                </p>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 border-b border-gray-200 pb-2">
              Academic Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-900">Country:</span>
                <p className="text-gray-600">
                  {safeString(application.country)}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">
                  Academic Qualification:
                </span>
                <p className="text-gray-600">
                  {safeString(application.academicQualification)}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">
                  Desired Degree:
                </span>
                <p className="text-gray-600">
                  {safeString(application.desiredDegree)}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Referred By:</span>
                <p className="text-gray-600">
                  {safeString(application.referredBy)}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">
                  Referrer Contact:
                </span>
                <p className="text-gray-600">
                  {safeString(application.referrerContact)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {application.payment && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 border-b border-gray-200 pb-2">
              Payment Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-900">
                  Payment Status:
                </span>
                <div className="flex items-center mt-1">
                  {application.payment.status === "PAID" ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="mr-1" size={16} /> Paid
                    </span>
                  ) : application.payment.status === "PENDING" ? (
                    <span className="flex items-center text-yellow-600">
                      <Clock className="mr-1" size={16} /> Pending
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <XCircle className="mr-1" size={16} />{" "}
                      {application.payment.status}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-900">Amount:</span>
                <p className="text-gray-600 flex items-center">
                  <IndianRupee className="mr-1" size={16} />
                  {application.payment.amount} {application.payment.currency}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">
                  Payment Method:
                </span>
                <p className="text-gray-600 flex items-center">
                  <CreditCard className="mr-1" size={16} />
                  {application.payment.paymentMethod}
                </p>
              </div>
              {application.payment.paidAt && (
                <div>
                  <span className="font-medium text-gray-900">Paid At:</span>
                  <p className="text-gray-600">
                    {formatDate(application.payment.paidAt)}
                  </p>
                </div>
              )}
              {application.payment.transactionId && (
                <div className="sm:col-span-2">
                  <span className="font-medium text-gray-900">
                    Transaction ID:
                  </span>
                  <p className="text-gray-600 font-mono text-sm">
                    {application.payment.transactionId}
                  </p>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-900">Created At:</span>
                <p className="text-gray-600">
                  {formatDate(application.payment.createdAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Payment Information */}
        {!application.payment && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 border-b border-gray-200 pb-2">
              Payment Information
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 flex items-center">
                <XCircle className="mr-2" size={16} />
                No payment was made with this application
              </p>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 border-b border-gray-200 pb-2">
            Additional Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-900">
                Agrees to Terms:
              </span>
              <p className="text-gray-600">
                {application.agreesToTerms ? "Yes" : "No"}
              </p>
            </div>
            {application.certificateUrl && (
              <div>
                <span className="font-medium text-gray-900">Certificate:</span>
                <a
                  href={application.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View Certificate
                </a>
              </div>
            )}
            {application.recommendationLetterUrl && (
              <div>
                <span className="font-medium text-gray-900">
                  Recommendation Letter:
                </span>
                <a
                  href={application.recommendationLetterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View Letter
                </a>
              </div>
            )}
            {application.rejectionReason && (
              <div className="sm:col-span-2">
                <span className="font-medium text-gray-900">
                  Rejection Reason:
                </span>
                <p className="text-red-600 bg-red-50 p-2 rounded mt-1">
                  {application.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Application Date */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Application submitted on {formatDate(application.appliedAt)}
          </p>
        </div>
      </div>
    </ResponsiveModal>
  );
};

export default ApplicationDetails;
