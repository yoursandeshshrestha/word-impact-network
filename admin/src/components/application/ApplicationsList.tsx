import React from "react";
import { useAppDispatch } from "@/src/hooks/hooks";
import {
  Application,
  setSelectedApplication,
} from "@/src/redux/features/applicationsSlice";
import { formatDate } from "@/src/utils/formatters";

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
  const dispatch = useAppDispatch();

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
    dispatch(setSelectedApplication(application));
    onViewDetails(application);
  };

  return (
    <div
      className={`overflow-x-auto ${
        isDisabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Country
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Applied At
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {applications.length > 0 ? (
            applications.map((application) => (
              <tr
                key={application.applicationId}
                onClick={() => handleRowClick(application)}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
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
              </tr>
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
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationsList;
