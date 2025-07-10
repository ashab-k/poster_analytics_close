"use client";
import React, { useState, useEffect, useMemo } from "react";
import { PageState } from "@/components/ui/PageState";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  Calendar,
  Users,
  TrendingUp,
  Network,
  Filter,
  Search,
} from "lucide-react";
import {
  SplitContract,
  SplitContractsResponse,
  AnalyticsData,
  ChainInfo,
} from "../../types/Contracts";
import { CHAIN_NAMES } from "@/constants/chains";

const CHAIN_COLORS: Record<number, string> = {
  1: "#627EEA", // Ethereum
  137: "#8247E5", // Polygon
  8453: "#0052FF", // Base
  1514: "#FF6B35", // Story
  10: "#FF0420", // Optimism (example color)
  2818: "#00BFAE", // Morph (example color)
  5112: "#FFD700", // Ham (example color)
  10143: "#F6C343", // Arbitrum Nova (example color)
  42161: "#28A0EF", // Arbitrum (example color)
  84532: "#A1B8F7", // Base Sepolia (example color)
  325000: "#BADA55", // Camp Network (example color)
  7777777: "#E2BFFF", // Zora (example color)
  666666666: "#FF66CC", // Degen Chain (example color)
  999999999: "#B2F7EF", // Zora Testnet (example color)
  0: "#A0AEC0", // Farcaster (example color)
  123420001114: "#000000", // basecamp
};

const CHAIN_INFO: Record<number, ChainInfo> = Object.fromEntries(
  Object.entries(CHAIN_NAMES).map(([id, name]) => [
    Number(id),
    {
      id: Number(id),
      name,
      color: CHAIN_COLORS[Number(id)] || "#CCCCCC", // fallback color
    },
  ])
);

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const SplitContractsAnalytics: React.FC = () => {
  const [contracts, setContracts] = useState<SplitContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    chainId: "",
    userId: "",
    dateRange: "30",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data from API
  useEffect(() => {
    const fetchAllContracts = async () => {
      try {
        setLoading(true);
        setError(null);

        let allContracts: SplitContract[] = [];
        let currentPage = 1;
        let hasMorePages = true;
        const maxLimit = 100; // Use maximum limit per request

        while (hasMorePages) {
          const queryParams = new URLSearchParams({
            page: currentPage.toString(),
            limit: maxLimit.toString(),
            ...(filters.chainId && { chainId: filters.chainId }),
            ...(filters.userId && { userId: filters.userId }),
          });

          const response = await fetch(
            `/api/contracts/split-contracts?${queryParams}`
          );
          if (!response.ok)
            throw new Error(`Failed to fetch contracts (page ${currentPage})`);

          const data: SplitContractsResponse = await response.json();

          // Update total pages from first response
          // if (currentPage === 1) {
          //   totalPages = data.data.totalPages;
          // }

          // Add contracts from this page to our collection
          allContracts = [...allContracts, ...data.data.splitContracts];

          // Check if there are more pages
          hasMorePages = data.data.nextPage !== null;
          currentPage++;

          // Safety check to prevent infinite loops
          if (currentPage > 1000) {
            console.warn(
              "Reached maximum page limit (1000) - stopping pagination"
            );
            break;
          }
        }

        setContracts(allContracts);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching contracts"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllContracts();
  }, [filters.chainId, filters.userId]);

  // Calculate analytics data
  const analyticsData: AnalyticsData = useMemo(() => {
    const filteredContracts = contracts.filter((contract) => {
      const matchesSearch =
        searchTerm === "" ||
        contract.contract_address
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        contract.user_id.toString().includes(searchTerm);

      // Handle date filtering
      let matchesDate = true;
      if (filters.dateRange !== "all") {
        const contractDate = new Date(contract.createdAt);
        const daysAgo = parseInt(filters.dateRange);
        const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        matchesDate = contractDate >= cutoffDate;
      }

      return matchesSearch && matchesDate;
    });

    // Unique recipients
    const uniqueRecipients = new Set();
    filteredContracts.forEach((contract) => {
      contract.args.recipients.forEach((recipient) => {
        uniqueRecipients.add(recipient.address);
      });
    });

    // Average split size
    const totalRecipients = filteredContracts.reduce(
      (sum, contract) => sum + contract.args.recipients.length,
      0
    );
    const averageSplitSize =
      filteredContracts.length > 0
        ? totalRecipients / filteredContracts.length
        : 0;

    // Chain distribution
    const chainCounts = filteredContracts.reduce((acc, contract) => {
      acc[contract.chain_id] = (acc[contract.chain_id] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const chainDistribution = Object.entries(chainCounts).map(
      ([chainId, count]) => ({
        chainId: parseInt(chainId),
        count,
        name: CHAIN_INFO[parseInt(chainId)]?.name || `Chain ${chainId}`,
      })
    );

    // Top users
    const userCounts = filteredContracts.reduce((acc, contract) => {
      acc[contract.user_id] = (acc[contract.user_id] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const topUsers = Object.entries(userCounts)
      .map(([userId, count]) => ({ userId: parseInt(userId), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Allocation patterns
    const patterns = filteredContracts.reduce((acc, contract) => {
      const recipients = contract.args.recipients;
      let pattern: string;

      if (
        recipients.length === 2 &&
        recipients.every((r) => r.percentAllocation === 50)
      ) {
        pattern = "50-50 Split";
      } else if (
        recipients.length === 3 &&
        recipients.some(
          (r) => r.percentAllocation === 33 || r.percentAllocation === 34
        )
      ) {
        pattern = "Equal 3-Way";
      } else if (
        recipients.every(
          (r) => r.percentAllocation === Math.floor(100 / recipients.length)
        )
      ) {
        pattern = `Equal ${recipients.length}-Way`;
      } else {
        pattern = "Custom Split";
      }

      acc[pattern] = (acc[pattern] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const allocationPatterns = Object.entries(patterns).map(
      ([pattern, count]) => ({ pattern, count })
    );

    // Timeline data
    const timelineMap = filteredContracts.reduce((acc, contract) => {
      const date = new Date(contract.createdAt).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timelineData = Object.entries(timelineMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalContracts: filteredContracts.length,
      uniqueRecipients: uniqueRecipients.size,
      averageSplitSize: Math.round(averageSplitSize * 10) / 10,
      chainDistribution,
      topUsers,
      allocationPatterns,
      timelineData,
    };
  }, [contracts, filters.dateRange, searchTerm]);

  return (
    <PageState
      loading={loading}
      error={error}
      loadingProps={{ message: "Loading split contracts data..." }}
      errorProps={{ onRetry: () => window.location.reload() }}
    >
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Split Contracts Analytics
            </h1>
            <p className="mt-2 text-gray-600">
              Comprehensive analysis of split contract deployments and usage
              patterns
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <select
                  value={filters.chainId}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, chainId: e.target.value }))
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Chains</option>
                  {Object.values(CHAIN_INFO).map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by contract address or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Contracts
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analyticsData.totalContracts}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Network className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Unique Recipients
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analyticsData.uniqueRecipients}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg Split Size
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analyticsData.averageSplitSize}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Chains
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analyticsData.chainDistribution.length}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Network className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Timeline Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contract Creation Timeline
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Chain Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chain Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.chainDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData.chainDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Allocation Patterns */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Split Patterns
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.allocationPatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="pattern" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Users Table */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Active Users
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contracts Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage of Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.topUsers.map((user, index) => (
                    <tr
                      key={user.userId}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.userId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(
                          (user.count / analyticsData.totalContracts) *
                          100
                        ).toFixed(1)}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageState>
  );
};

export default SplitContractsAnalytics;
