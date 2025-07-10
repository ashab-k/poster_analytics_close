"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/users/DashboardLayout";
import { DashboardHeader } from "@/components/users/DashboardHeader";
import { PageState } from "@/components/ui/PageState";
import { getCachedData, setCachedData } from "@/lib/cache";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatDistanceToNow,
  format,
  subDays,
} from "date-fns";
import { Activity, Share2, TrendingUp, Layers, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { CHAIN_NAMES } from "@/constants/chains";

interface Contract {
  id: number;
  slug: string;
  canvasId: number;
  contract: string;
  createdAt: string;
  hash: string;
  chainId: string;
  contractType: string;
}

const CACHE_KEY = "mint_editions_cache";

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  bgColor,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  bgColor?: string;
}) => (
  <div className={`${bgColor || "bg-white"} rounded-lg shadow-sm p-6`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        {trend !== undefined && (
          <p
            className={`text-sm mt-1 ${trend >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}% {trendLabel}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${bgColor ? "bg-white" : "bg-gray-50"}`}>
        <Icon className="h-6 w-6 text-gray-600" />
      </div>
    </div>
  </div>
);

const ChainDistributionChart = ({ data }: { data: { [key: string]: number } }) => {
  const chartData = useMemo(() => {
    return Object.entries(data).map(([chainId, count]) => ({
      name: CHAIN_NAMES[Number(chainId)] || chainId,
      value: count,
    }));
  }, [data]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium mb-4">Chain Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} />
            <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Editions"]} />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const ContractTypesChart = ({ data }: { data: { [key: string]: number } }) => {
  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316"];
  const chartData = useMemo(() => {
    return Object.entries(data).map(([type, count]) => ({
      name: type,
      value: count,
    }));
  }, [data]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium mb-4">Contract Types Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Editions"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const ActivityOverTimeChart = ({ data }: { data: Contract[] }) => {
  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: format(date, "MMM dd"),
        count: 0,
      };
    }).reverse();
    data.forEach((contract) => {
      const date = format(new Date(contract.createdAt), "MMM dd");
      const dayData = last30Days.find((d) => d.date === date);
      if (dayData) {
        dayData.count++;
      }
    });
    return last30Days;
  }, [data]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium mb-4">Minting Activity (Last 30 Days)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} allowDecimals={false} />
            <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Editions"]} />
            <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#6366f1" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const columnHelper = createColumnHelper<Contract>();
const columns = [
  columnHelper.accessor("canvasId", {
    header: "Canvas ID",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("contract", {
    header: "Contract Address",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <span className="text-gray-900">{info.getValue().slice(0, 6)}...{info.getValue().slice(-4)}</span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => navigator.clipboard.writeText(info.getValue())}>
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  }),
  columnHelper.accessor("chainId", {
    header: "Chain",
    cell: (info) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {CHAIN_NAMES[Number(info.getValue())] || info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("contractType", {
    header: "Type",
    cell: (info) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Created",
    cell: (info) => (
      <span className="text-gray-600">
        {formatDistanceToNow(new Date(info.getValue()), { addSuffix: true })}
      </span>
    ),
  }),
  columnHelper.accessor("hash", {
    header: "Hash",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <span className="text-gray-900">{info.getValue().slice(0, 6)}...{info.getValue().slice(-4)}</span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => navigator.clipboard.writeText(info.getValue())}>
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  }),
];

export default function MintEditionsPage() {
  const [allContracts, setAllContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChainId, setSelectedChainId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });
  const [quickDateRange, setQuickDateRange] = useState("30");

  const fetchAllData = async (chainId: string) => {
    try {
      setIsLoading(true);
      let allData: Contract[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      // Try to get cached data first
      const cacheKey = `${CACHE_KEY}_all_${chainId}`;
      const cachedData = getCachedData<Contract[]>(cacheKey);

      if (cachedData) {
        setAllContracts(cachedData);
        // setData({ // This line was removed as per the edit hint.
        //   status: "success",
        //   code: 200,
        //   data: {
        //     contracts: cachedData,
        //     totalPages: Math.ceil(cachedData.length / 20),
        //     currentPage: 1,
        //     nextPage: 2,
        //     filters: {
        //       chainId,
        //       contractType: "",
        //     },
        //   },
        // });
        setError(null);
        setIsLoading(false);
        return;
      }

      while (hasMorePages) {
        const response = await fetch(
          `/api/contracts/mint-editions?page=${currentPage}&limit=20&chainId=${chainId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result || !result.data || !Array.isArray(result.data.contracts)) {
          throw new Error("Invalid data format received from server");
        }

        allData = [...allData, ...result.data.contracts];

        // Check if we've reached the last page
        hasMorePages = currentPage < result.data.totalPages;
        currentPage++;
      }

      // Cache the complete dataset
      setCachedData(cacheKey, allData);

      setAllContracts(allData);
      // setData({ // This line was removed as per the edit hint.
      //   status: "success",
      //   code: 200,
      //   data: {
      //     contracts: allData,
      //     totalPages: Math.ceil(allData.length / 20),
      //     currentPage: 1,
      //     nextPage: 2,
      //     filters: {
      //       chainId,
      //       contractType: "",
      //     },
      //   },
      // });
      setError(null);
    } catch (err) {
      console.error("Error fetching mint editions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load mint editions data"
      );

      // If we have cached data, use it as fallback
      const cacheKey = `${CACHE_KEY}_all_${chainId}`;
      const cachedData = getCachedData<Contract[]>(cacheKey);
      if (cachedData) {
        setAllContracts(cachedData);
        // setData({ // This line was removed as per the edit hint.
        //   status: "success",
        //   code: 200,
        //   data: {
        //     contracts: cachedData,
        //     totalPages: Math.ceil(cachedData.length / 20),
        //     currentPage: 1,
        //     nextPage: 2,
        //     filters: {
        //       chainId,
        //       contractType: "",
        //     },
        //   },
        // });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData(selectedChainId);
  }, [selectedChainId]);

  const handleChainIdChange = (value: string) => {
    setSelectedChainId(value);
    fetchAllData(value === "all" ? "" : value);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedChainId("all");
    setDateRange({
      start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
      end: format(new Date(), "yyyy-MM-dd"),
    });
    setQuickDateRange("30");
    fetchAllData("");
  };

  const handleDateRangeChange = (field: "start" | "end", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuickDateRangeChange = (value: string) => {
    const days = parseInt(value);
    setDateRange({
      start: format(subDays(new Date(), days), "yyyy-MM-dd"),
      end: format(new Date(), "yyyy-MM-dd"),
    });
    setQuickDateRange(value);
  };

  const filteredContracts = useMemo(() => {
    if (!allContracts) return [];
    const searchLower = searchQuery.toLowerCase();
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    return allContracts.filter((contract) => {
      const contractDate = new Date(contract.createdAt);
      return (
        (contract.contract.toLowerCase().includes(searchLower) ||
          contract.slug.toLowerCase().includes(searchLower) ||
          contract.hash.toLowerCase().includes(searchLower)) &&
        contractDate >= startDate &&
        contractDate <= endDate
      );
    });
  }, [allContracts, searchQuery, dateRange]);

  const table = useReactTable({
    data: filteredContracts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const analytics = useMemo(() => {
    if (!allContracts) return null;
    const calculateAnalytics = () => {
      const contracts = allContracts;
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      // Total contracts
      const totalContracts = contracts.length;
      // Contracts by chain
      const contractsByChain = contracts.reduce((acc, contract) => {
        acc[contract.chainId] = (acc[contract.chainId] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      // Most active chain
      const mostActiveChain = Object.entries(contractsByChain).reduce(
        (a, b) => (b[1] > a[1] ? b : a),
        ["", 0] as [string, number]
      );
      // Recent activity (last 30 days)
      const recentActivity = contracts.filter(
        (contract) => new Date(contract.createdAt) > thirtyDaysAgo
      ).length;
      // Contract types distribution
      const contractTypes = contracts.reduce((acc, contract) => {
        acc[contract.contractType] = (acc[contract.contractType] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      return {
        totalContracts,
        mostActiveChain,
        recentActivity,
        contractTypes,
        contractsByChain,
      };
    };
    return calculateAnalytics();
  }, [allContracts]);

  return (
    <PageState
      loading={isLoading && !allContracts.length}
      error={error && !allContracts.length ? error : null}
      loadingProps={{ message: "Loading mint editions data..." }}
      errorProps={{ onRetry: () => window.location.reload() }}
    >
      <DashboardLayout>
        <DashboardHeader
          title="Mint Editions"
          subtitle="View and manage minted editions across different chains"
        />

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard
            title="Total Minted Editions"
            value={analytics?.totalContracts || 0}
            icon={Layers}
            bgColor="bg-blue-50"
          />
          <StatsCard
            title="Most Active Chain"
            value={
              analytics?.mostActiveChain
                ? `${CHAIN_NAMES[Number(analytics.mostActiveChain[0])]} (${
                    analytics.mostActiveChain[1]
                  })`
                : "N/A"
            }
            icon={TrendingUp}
            bgColor="bg-green-50"
          />
          <StatsCard
            title="Deployment Activity (30d)"
            value={analytics?.recentActivity || 0}
            icon={Activity}
            bgColor="bg-purple-50"
          />
        </div>

        {/* Activity Over Time Chart */}
        <div className="mb-6">
          <ActivityOverTimeChart data={allContracts} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChainDistributionChart data={analytics?.contractsByChain || {}} />
          <ContractTypesChart data={analytics?.contractTypes || {}} />
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Input
              placeholder="Search by contract address, slug, or hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Select value={selectedChainId} onValueChange={handleChainIdChange}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Select Chain" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Chains</SelectItem>
                {Object.entries(CHAIN_NAMES).map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={quickDateRange}
              onValueChange={handleQuickDateRangeChange}
            >
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Select Time Range" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="365">Last 365 Days</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => handleDateRangeChange("start", e.target.value)}
                className="w-[150px]"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => handleDateRangeChange("end", e.target.value)}
                className="w-[150px]"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Reset Filters
            </Button>
          </div>

          <div className="rounded-md border shadow-sm">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="bg-gray-50 hover:bg-gray-50"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="font-semibold cursor-pointer select-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                {"<<"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                {">>"}
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </PageState>
  );
}
