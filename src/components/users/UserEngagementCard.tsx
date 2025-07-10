// components/analytics/UserEngagementCard.tsx

import React from "react";
import { UserEngagement } from "@/types/User";
import { ProgressCircle } from "./ProgressCircle";
interface UserEngagementCardProps {
  data: UserEngagement;
  totalUsers: number;
}

export const UserEngagementCard: React.FC<UserEngagementCardProps> = ({
  data,
  totalUsers,
}) => {
  const canvasCreationRate =
    totalUsers > 0 ? (data.usersWithCanvases / totalUsers) * 100 : 0;
  const publishingRate =
    totalUsers > 0 ? (data.usersWithPublishedCanvases / totalUsers) * 100 : 0;
  const activeUsersRate =
    totalUsers > 0 ? (data.activeUsersLast30Days / totalUsers) * 100 : 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium mb-4">User Engagement</h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center">
          <ProgressCircle
            value={canvasCreationRate}
            color="#3b82f6"
            size={80}
            strokeWidth={8}
          />
          <p className="mt-2 text-sm font-medium text-center">
            Canvas Creation
          </p>
          <p className="text-xs text-gray-500 text-center">
            {data.usersWithCanvases.toLocaleString()} users
          </p>
        </div>

        <div className="flex flex-col items-center">
          <ProgressCircle
            value={publishingRate}
            color="#10b981"
            size={80}
            strokeWidth={8}
          />
          <p className="mt-2 text-sm font-medium text-center">
            Published Canvases
          </p>
          <p className="text-xs text-gray-500 text-center">
            {data.usersWithPublishedCanvases.toLocaleString()} users
          </p>
        </div>

        <div className="flex flex-col items-center">
          <ProgressCircle
            value={activeUsersRate}
            color="#8b5cf6"
            size={80}
            strokeWidth={8}
          />
          <p className="mt-2 text-sm font-medium text-center">
            Active Users (30d)
          </p>
          <p className="text-xs text-gray-500 text-center">
            {data.activeUsersLast30Days.toLocaleString()} users
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium mb-2">Activity Levels</h4>
        <div className="flex items-center">
          <div
            className="h-3 bg-red-400 rounded-l"
            style={{
              width: `${
                (data.activityLevels.low_activity / totalUsers) * 100
              }%`,
            }}
          />
          <div
            className="h-3 bg-yellow-400"
            style={{
              width: `${
                (data.activityLevels.medium_activity / totalUsers) * 100
              }%`,
            }}
          />
          <div
            className="h-3 bg-green-400 rounded-r"
            style={{
              width: `${
                (data.activityLevels.high_activity / totalUsers) * 100
              }%`,
            }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Low: {data.activityLevels.low_activity.toLocaleString()}</span>
          <span>
            Medium: {data.activityLevels.medium_activity.toLocaleString()}
          </span>
          <span>
            High: {data.activityLevels.high_activity.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
