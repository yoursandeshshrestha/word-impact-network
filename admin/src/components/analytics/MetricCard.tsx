import React, { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: ReactNode;
  className?: string;
  valueClassName?: string;
  footer?: ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  trend,
  icon,
  className = "",
  valueClassName = "",
  footer,
}) => {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
    >
      <div className="flex flex-row items-center justify-between p-4 pb-2">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          {description && (
            <p className="text-xs text-gray-400">{description}</p>
          )}
        </div>
        {icon && <div className="text-gray-500">{icon}</div>}
      </div>
      <div className="p-4 pt-2">
        <div className={`text-3xl font-bold ${valueClassName}`}>{value}</div>

        {trend && (
          <div className="flex items-center mt-1">
            <span
              className={`text-xs font-medium flex items-center ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(trend.value)}%{" "}
              <span className="text-gray-500 ml-1">from previous period</span>
            </span>
          </div>
        )}

        {footer && <div className="mt-3">{footer}</div>}
      </div>
    </div>
  );
};

export default MetricCard;
