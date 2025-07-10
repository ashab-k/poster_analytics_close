// components/analytics/UserGrowthChart.tsx

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { UserGrowthPoint } from "@/types/User";

interface UserGrowthChartProps {
  data: UserGrowthPoint[];
}

export const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ data }) => {
  // Format month labels (show YYYY-MM)
  const formattedData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      formattedMonth: point.month, // Keep full YYYY-MM format
    }));
  }, [data]);

  // Calculate cumulative growth
  const cumulativeData = useMemo(() => {
    let total = 0;
    return formattedData.map((point) => {
      total += point.count;
      return {
        ...point,
        cumulative: total,
      };
    });
  }, [formattedData]);

  return (
    <div className="w-full h-full bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium mb-4">User Growth Over Time</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={cumulativeData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 10 }} 
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "cumulative")
                  return [value.toLocaleString(), "Total Users"];
                if (name === "count")
                  return [value.toLocaleString(), "New Users"];
                return [value, name];
              }}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
              }}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                border: "none",
              }}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              name="Total Users"
              label="cumulative"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="count"
              label="total"
              name="New Users"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
