import React from "react";
import { Application } from "@/redux/features/applicationsSlice";
import { formatDate } from "@/utils/formatters";
import ResponsiveTable from "@/components/common/ResponsiveTable";
import ResponsiveTableRow, {
  ResponsiveTableMobileCard,
} from "@/components/common/ResponsiveTableRow";
import { CreditCard, CheckCircle, XCircle } from "lucide-react";

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

  const headers = [
    "Name",
    "Email",
    "Country",
    "Applied Date",
    "Status",
    "Payment",
  ];

  const mobileCards = applications.map((application) => (
    <ResponsiveTableMobileCard
      key={application.applicationId}
      onClick={() => handleRowClick(application)}
    >
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
          <div className="flex flex-col items-end gap-1">
            <span
              className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                application.status
              )}`}
            >
              {application.status}
            </span>
            {/* Payment Indicator */}
            <div className="flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-gray-400" />
              {application.payment ? (
                application.payment.status === "PAID" ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-500" />
                )
              ) : (
                <XCircle className="w-3 h-3 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Applied Date */}
        <div className="text-sm text-gray-500">
          Applied: {formatDate(application.appliedAt)}
        </div>
      </div>
    </ResponsiveTableMobileCard>
  ));

  return (
    <ResponsiveTable headers={headers} mobileCards={mobileCards}>
      {applications.length > 0 ? (
        applications.map((application) => (
          <ResponsiveTableRow
            key={application.applicationId}
            onClick={() => handleRowClick(application)}
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
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                {application.payment ? (
                  application.payment.status === "PAID" ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">
                        ₹{application.payment.amount}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600 font-medium">
                        {application.payment.status}
                      </span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">No Payment</span>
                  </div>
                )}
              </div>
            </td>
          </ResponsiveTableRow>
        ))
      ) : (
        <tr>
          <td
            colSpan={6}
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
