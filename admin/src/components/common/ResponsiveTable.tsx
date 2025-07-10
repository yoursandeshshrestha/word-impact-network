import React from "react";

interface ResponsiveTableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  headers,
  children,
  className = "",
}) => {
  return (
    <div className={`overflow-hidden ${className}`}>
      {/* Desktop Table */}
      <div className="hidden xl:block overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {children}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="xl:hidden space-y-4">{children}</div>
    </div>
  );
};

export default ResponsiveTable;
