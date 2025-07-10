// components/analytics/UserStatsCard.tsx

import React from "react";
import { LucideIcon } from "lucide-react";

interface UserStatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  bgColor?: string;
}

export const UserStatsCard: React.FC<UserStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  bgColor = "bg-blue-50",
}) => {
  return (
    <div className="rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value.toLocaleString()}</h3>

          {trend !== undefined && (
            <p
              className={`text-xs flex items-center mt-2 ${
                trend >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              <span className="mr-1">{trend >= 0 ? "↑" : "↓"}</span>
              <span>{Math.abs(trend)}%</span>
              {trendLabel && (
                <span className="ml-1 text-gray-500">{trendLabel}</span>
              )}
            </p>
          )}
        </div>

        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className="w-6 h-6 text-blue-500" />
        </div>
      </div>
    </div>
  );
};
