"use client";
import React from "react";
import { XCircle, CheckCircle, FileText, Clock } from "lucide-react";

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

interface ApplicationModalProps {
  application: ApplicationData;
  onClose: () => void;
  onUpdateStatus: (
    id: string,
    status: "APPROVED" | "REJECTED" | "PENDING",
    rejectionReason?: string
  ) => void;
  onDelete: (id: string) => void;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({
  application,
  onClose,
  onUpdateStatus,
  onDelete,
}) => {
  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Download document handler
  const downloadDocument = (url: string | null, documentName: string) => {
    if (!url) {
      alert(`No ${documentName} available`);
      return;
    }

    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4 shadow-xl">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Application Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              {/* Personal Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Personal Information
                </h4>
                <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                  <p className="text-lg font-semibold">
                    {application.fullName}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p>{application.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <p>{application.phoneNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Gender:</span>
                      <p>{application.gender}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Age:</span>
                      <p>{calculateAge(application.dateOfBirth)} years</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Country:</span>
                      <p>{application.country}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Date of Birth:</span>
                      <p>{formatDate(application.dateOfBirth)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Academic Information
                </h4>
                <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">
                        Current Qualification:
                      </span>
                      <p className="font-medium">
                        {application.academicQualification}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">
                        Desired Degree/Program:
                      </span>
                      <p className="font-medium">{application.desiredDegree}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Referral Information
                </h4>
                <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Referred By:</span>
                      <p className="font-medium">{application.referredBy}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Referrer Contact:</span>
                      <p className="font-medium">
                        {application.referrerContact}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Application Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Application Status
                </h4>
                <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        application.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : application.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {application.status.charAt(0) +
                        application.status.slice(1).toLowerCase()}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(application.appliedAt)}
                    </div>
                  </div>

                  {application.reviewedAt && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-500">Reviewed on:</span>
                      <p>{formatDate(application.reviewedAt)}</p>
                    </div>
                  )}

                  {application.rejectionReason && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">
                        Rejection Reason:
                      </span>
                      <p className="mt-1 text-sm bg-red-50 p-2 rounded border border-red-100">
                        {application.rejectionReason}
                      </p>
                    </div>
                  )}

                  {application.reviewedBy && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-500">Reviewed by:</span>
                      <p>{application.reviewedBy}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-sm font-medium text-gray-500">Documents</h4>
                <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <button
                        onClick={() =>
                          downloadDocument(
                            application.certificateUrl,
                            "Certificate"
                          )
                        }
                        className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md w-full ${
                          application.certificateUrl
                            ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!application.certificateUrl}
                      >
                        <FileText className="h-4 w-4" />
                        {application.certificateUrl
                          ? "View Certificate"
                          : "No Certificate Available"}
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={() =>
                          downloadDocument(
                            application.recommendationLetterUrl,
                            "Recommendation Letter"
                          )
                        }
                        className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md w-full ${
                          application.recommendationLetterUrl
                            ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!application.recommendationLetterUrl}
                      >
                        <FileText className="h-4 w-4" />
                        {application.recommendationLetterUrl
                          ? "View Recommendation Letter"
                          : "No Recommendation Letter Available"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Legal Information
                </h4>
                <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        application.agreesToTerms
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {application.agreesToTerms
                        ? "Agreed to Terms & Conditions"
                        : "Did Not Agree to Terms & Conditions"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
          <div className="flex space-x-2">
            {application.status === "PENDING" && (
              <>
                <button
                  onClick={() =>
                    onUpdateStatus(application.applicationId, "APPROVED")
                  }
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => {
                    const reason = prompt(
                      "Please provide a reason for rejection:"
                    );
                    if (reason) {
                      onUpdateStatus(
                        application.applicationId,
                        "REJECTED",
                        reason
                      );
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </button>
              </>
            )}
            {application.status !== "PENDING" && (
              <button
                onClick={() =>
                  onUpdateStatus(application.applicationId, "PENDING")
                }
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reset to Pending
              </button>
            )}
            <button
              onClick={() => {
                if (
                  confirm("Are you sure you want to delete this application?")
                ) {
                  onDelete(application.applicationId);
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;
