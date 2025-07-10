// components/analytics/SocialConnectionsChart.tsx

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SocialConnections } from "@/types/User";

interface SocialConnectionsChartProps {
  data: SocialConnections;
}

export const SocialConnectionsChart: React.FC<SocialConnectionsChartProps> = ({
  data,
}) => {
  const chartData = useMemo(
    () => [
      { name: "Farcaster", users: data.farcaster_users },
      { name: "Twitter", users: data.twitter_users },
      { name: "Multiple", users: data.usersWithMultipleSocials },
    ],
    [data]
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium mb-4">Social Platform Connections</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} />
            <Tooltip
              formatter={(value) => [Number(value).toLocaleString(), "Users"]}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                border: "none",
              }}
            />
            <Bar dataKey="users" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
