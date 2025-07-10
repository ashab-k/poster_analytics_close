"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/users/DashboardLayout";
import { DashboardHeader } from "@/components/users/DashboardHeader";
import { PageState } from "@/components/ui/PageState";
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
import { formatDistanceToNow, format } from "date-fns";
import {
  FileText,
  TrendingUp,
  Layers,
  Calendar,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
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
import {
  StoryStat,
  StoryDataResponse,
  StoryAnalytics,
} from "@/types/StoryData";

// Stats card component
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
            className={`text-sm mt-1 ${
              trend >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}% {trendLabel}
          </p>
        )}
      </div>
      <div
        className={`p-3 rounded-full ${bgColor ? "bg-white" : "bg-gray-50"}`}
      >
        <Icon className="h-6 w-6 text-gray-600" />
      </div>
    </div>
  </div>
);

// Chart components
const IpTypeDistributionChart = ({
  data,
}: {
  data: { type: string; count: number }[];
}) => {
  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316"];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium mb-4">IP Type Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ type, percent }) =>
                `${type} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              nameKey="type"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [Number(value).toLocaleString(), "IPs"]}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                border: "none",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const TimelineChart = ({
  data,
}: {
  data: { date: string; count: number }[];
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium mb-4">IP Registration Timeline</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => format(new Date(value), "MMM dd")}
            />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} />
            <Tooltip
              formatter={(value) => [Number(value).toLocaleString(), "IPs"]}
              labelFormatter={(value) =>
                format(new Date(value), "MMM dd, yyyy")
              }
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                border: "none",
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default function StoryDataPage() {
  const [stats, setStats] = useState<StoryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    ipType: "all",
    dateRange: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          ...(filters.ipType !== "all" && { ipType: filters.ipType }),
        });

        const response = await fetch(`/api/story-data?${queryParams}`);
        if (!response.ok) throw new Error(`Failed to fetch story data`);

        const data: StoryDataResponse = await response.json();
        setStats(data.data.stats);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching story data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.ipType]);

  // Calculate analytics
  const analytics: StoryAnalytics = useMemo(() => {
    const filteredStats = stats.filter((stat) => {
      const matchesSearch =
        searchTerm === "" ||
        stat.spgNftContract.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stat.canvasId.toString().includes(searchTerm) ||
        stat.ipType.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesDate = true;
      if (filters.dateRange !== "all") {
        const statDate = new Date(stat.createdAt);
        const daysAgo = parseInt(filters.dateRange);
        const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        matchesDate = statDate >= cutoffDate;
      }

      return matchesSearch && matchesDate;
    });

    // Basic counts
    const totalIps = filteredStats.length;
    const freshIps = filteredStats.filter(
      (stat) => stat.ipType === "fresh_ip"
    ).length;
    const derivativeIps = filteredStats.filter(
      (stat) => stat.ipType === "derivative_ip"
    ).length;

    // IP type distribution (force labels to 'Fresh IP' and 'Derivative IP')
    const ipTypeCounts = filteredStats.reduce((acc, stat) => {
      const ipTypeStr = String(stat.ipType);
      let typeLabel: string;
      if (ipTypeStr === "fresh_ip" || ipTypeStr === "1") {
        typeLabel = "Fresh IP";
      } else if (ipTypeStr === "derivative_ip" || ipTypeStr === "0") {
        typeLabel = "Derivative IP";
      } else {
        typeLabel = ipTypeStr;
      }
      acc[typeLabel] = (acc[typeLabel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ipTypeDistribution = Object.entries(ipTypeCounts).map(
      ([type, count]) => ({
        type,
        count,
      })
    );

    // Canvas distribution
    const canvasCounts = filteredStats.reduce((acc, stat) => {
      acc[stat.canvasId] = (acc[stat.canvasId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const canvasDistribution = Object.entries(canvasCounts)
      .map(([canvasId, count]) => ({ canvasId: parseInt(canvasId), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Timeline data
    const timelineData = filteredStats.reduce((acc, stat) => {
      const date = format(new Date(stat.createdAt), "yyyy-MM-dd");
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timelineArray = Object.entries(timelineData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      totalIps,
      freshIps,
      derivativeIps,
      timelineData: timelineArray,
      ipTypeDistribution,
      canvasDistribution,
    };
  }, [stats, searchTerm, filters.dateRange]);

  // Table configuration
  const columnHelper = createColumnHelper<StoryStat>();

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("ipType", {
      header: "IP Type",
      cell: (info) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            info.getValue() === "fresh_ip"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {info.getValue() === "fresh_ip" ? "Fresh IP" : "Derivative IP"}
        </span>
      ),
    }),
    columnHelper.accessor("spgNftContract", {
      header: "Contract",
      cell: (info) => (
        <span className="font-mono text-sm">
          {info.getValue().slice(0, 8)}...{info.getValue().slice(-6)}
        </span>
      ),
    }),
    columnHelper.accessor("canvasId", {
      header: "Canvas ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("ipData", {
      header: "IP Data",
      cell: (info) => (
        <span className="text-sm text-gray-600">
          {info.getValue().length > 0
            ? `${info.getValue().length} items`
            : "No data"}
        </span>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: (info) => (
        <span className="text-sm text-gray-600">
          {formatDistanceToNow(new Date(info.getValue()), { addSuffix: true })}
        </span>
      ),
    }),
  ];

  const table = useReactTable({
    data: stats,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: searchTerm,
    },
    onGlobalFilterChange: setSearchTerm,
  });

  const handleIpTypeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, ipType: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      ipType: "all",
      dateRange: "all",
    });
    setSearchTerm("");
  };

  const handleDateRangeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, dateRange: value }));
  };

  return (
    <PageState
      loading={loading}
      error={error}
      loadingProps={{ message: "Loading story data..." }}
      errorProps={{ onRetry: () => window.location.reload() }}
    >
      <DashboardLayout>
        <div className="space-y-6">
          <DashboardHeader
            title="Story Data Analytics"
            subtitle="Comprehensive analysis of IP registrations and their distribution across platforms"
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard
              title="Total IPs Registered"
              value={analytics.totalIps.toLocaleString()}
              icon={FileText}
              bgColor="bg-gradient-to-r from-blue-50 to-indigo-50"
            />
            <StatsCard
              title="Fresh IPs"
              value={analytics.freshIps.toLocaleString()}
              icon={TrendingUp}
              bgColor="bg-gradient-to-r from-green-50 to-emerald-50"
            />
            <StatsCard
              title="Derivative IPs"
              value={analytics.derivativeIps.toLocaleString()}
              icon={Layers}
              bgColor="bg-gradient-to-r from-purple-50 to-violet-50"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IpTypeDistributionChart data={analytics.ipTypeDistribution} />
            <TimelineChart data={analytics.timelineData} />
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select
                    value={filters.ipType}
                    onValueChange={handleIpTypeChange}
                  >
                    <SelectTrigger className="w-40 bg-gray-50 border-gray-200">
                      <SelectValue placeholder="IP Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="fresh_ip">Fresh IP</SelectItem>
                      <SelectItem value="derivative_ip">
                        Derivative IP
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <Select
                    value={filters.dateRange}
                    onValueChange={handleDateRangeChange}
                  >
                    <SelectTrigger className="w-40 bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search contracts, canvas IDs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reset</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-medium">IP Registration Data</h3>
              <p className="text-sm text-gray-600 mt-1">
                Showing {table.getFilteredRowModel().rows.length} of{" "}
                {stats.length} total records
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
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
              </div>
              <div className="text-sm text-gray-600">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </PageState>
  );
}
