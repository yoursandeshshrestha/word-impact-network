import React from "react";
import { Application } from "@/redux/features/applicationsSlice";
import { formatDate } from "@/utils/formatters";
import ResponsiveTable from "@/components/common/ResponsiveTable";
import ResponsiveTableRow from "@/components/common/ResponsiveTableRow";

interface ApplicationsListProps {
  applications: Application[];
  onViewDetails: (application: Application) => void;
  isDisabled?: boolean;
}

const ApplicationsList: React.FC<ApplicationsListProps> = ({
  applications,
  onViewDetails,
  isDisabled = false,
}) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const handleRowClick = (application: Application) => {
    if (!isDisabled) {
      onViewDetails(application);
    }
  };

  const headers = ["Name", "Email", "Country", "Applied Date", "Status"];

  return (
    <ResponsiveTable headers={headers}>
      {applications.length > 0 ? (
        applications.map((application) => (
          <ResponsiveTableRow
            key={application.applicationId}
            onClick={() => handleRowClick(application)}
            mobileCardContent={
              <div className="space-y-3">
                {/* Application Info */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {application.fullName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {application.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {application.country}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                      application.status
                    )}`}
                  >
                    {application.status}
                  </span>
                </div>

                {/* Applied Date */}
                <div className="text-sm text-gray-500">
                  Applied: {formatDate(application.appliedAt)}
                </div>
              </div>
            }
          >
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {application.fullName}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              {application.email}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              {application.country}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              {formatDate(application.appliedAt)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                  application.status
                )}`}
              >
                {application.status}
              </span>
            </td>
          </ResponsiveTableRow>
        ))
      ) : (
        <tr>
          <td
            colSpan={5}
            className="px-6 py-8 text-center text-sm text-gray-500"
          >
            No applications found
          </td>
        </tr>
      )}
    </ResponsiveTable>
  );
};

export default ApplicationsList;
