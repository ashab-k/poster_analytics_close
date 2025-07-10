// components/analytics/WalletDistributionChart.tsx

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { WalletDistribution } from "@/types/User";

interface WalletDistributionChartProps {
  data: WalletDistribution;
}

export const WalletDistributionChart: React.FC<
  WalletDistributionChartProps
> = ({ data }) => {
  const chartData = [
    { name: "EVM Only", value: data.evm_users - data.both_wallets },
    { name: "Solana Only", value: data.solana_users - data.both_wallets },
    { name: "Both Wallets", value: data.both_wallets },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#8b5cf6"];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium mb-4">Wallet Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => {
                return [Number(value).toLocaleString(), name];
              }}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                border: "none",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
