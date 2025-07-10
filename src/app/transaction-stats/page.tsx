"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/users/DashboardLayout";
import { DashboardHeader } from "@/components/users/DashboardHeader";
import { PageState } from "@/components/ui/PageState";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CHAIN_NAMES } from "@/constants/chains";
import { Coins, Wallet, MessageSquare } from "lucide-react";

// Cache configuration
const CACHE_KEY = "transaction_stats_cache";
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Chain name mapping

interface CacheData {
  data: TransactionStats;
  timestamp: number;
}

interface TransactionStats {
  [chainId: string]: {
    PAYMENT: {
      totalCount: number;
      totalVolume: number;
      averageAmount: number;
      uniqueUsers: number;
      latestTransactionAt: string | null;
    };
    MINT: {
      totalCount: number;
      uniqueContracts: number;
      latestTransactionAt: string | null;
    };
    PUBLISH: {
      totalCount: number;
      platforms: { [key: string]: number };
      latestTransactionAt: string | null;
    };
  };
}

// Stats card component
const StatsCard = ({
  title,
  value,
  icon: Icon,
  bgColor,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  bgColor?: string;
}) => (
  <div className={`${bgColor || "bg-white"} rounded-lg shadow-sm p-6`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
      </div>
      <div
        className={`p-3 rounded-full ${bgColor ? "bg-white" : "bg-gray-50"}`}
      >
        <Icon className="h-6 w-6 text-gray-600" />
      </div>
    </div>
  </div>
);

export default function TransactionStatsPage() {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCachedData = (): CacheData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cacheData: CacheData = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - cacheData.timestamp < CACHE_DURATION) {
        return cacheData;
      }

      // Cache expired
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  };

  const setCachedData = (data: TransactionStats) => {
    try {
      const cacheData: CacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        // Check cache first
        const cachedData = getCachedData();
        if (cachedData) {
          setStats(cachedData.data);
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/transaction-stats");
        if (!response.ok) {
          throw new Error("Failed to fetch transaction stats");
        }
        const data = await response.json();
        setStats(data);
        setCachedData(data);
        setError(null);
      } catch (err) {
        setError(
          "Failed to load transaction statistics. Please try again later."
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Prepare data for charts
  let chainData = Object.entries(stats || {}).map(([chainId, data]) => ({
    name: CHAIN_NAMES[Number(chainId)] || `Chain ${chainId}`,
    mints: data.MINT.totalCount,
    payments: data.PAYMENT.totalCount,
  }));

  const farcasterPublishes = stats?.[0]?.PUBLISH.totalCount || 0;
  // Filter out chain 0 (Farcaster) from the chain data
  chainData = chainData.filter((chain) => chain.name !== CHAIN_NAMES[0]);

  const totalStats = {
    totalMints: chainData.reduce((sum, chain) => sum + chain.mints, 0),
    totalPayments: chainData.reduce((sum, chain) => sum + chain.payments, 0),
  };

  return (
    <PageState
      loading={isLoading}
      error={error || (!stats ? "No data available" : null)}
      loadingProps={{ message: "Loading transaction statistics..." }}
      errorProps={{ onRetry: () => window.location.reload() }}
    >
      <DashboardLayout>
        <DashboardHeader
          title="Transaction Statistics"
          subtitle="Overview of transaction activity across different chains"
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard
            title="Total Mints"
            value={totalStats.totalMints.toLocaleString()}
            icon={Coins}
            bgColor="bg-blue-50"
          />
          <StatsCard
            title="Total Payments"
            value={totalStats.totalPayments.toLocaleString()}
            icon={Wallet}
            bgColor="bg-purple-50"
          />
          <StatsCard
            title="Farcaster Publishes"
            value={farcasterPublishes.toLocaleString()}
            icon={MessageSquare}
            bgColor="bg-amber-50"
          />
        </div>

        {/* Transaction Distribution Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium mb-4">
            Transaction Distribution by Chain
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chainData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} />
                <Tooltip
                  formatter={(value) => [
                    Number(value).toLocaleString(),
                    "Transactions",
                  ]}
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "4px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    border: "none",
                  }}
                />
                <Bar
                  dataKey="mints"
                  name="Mints"
                  stackId="a"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="payments"
                  name="Payments"
                  stackId="a"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DashboardLayout>
    </PageState>
  );
}
