"use client";

import React, { useEffect, useState, useMemo } from "react";
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
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DollarSign, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, Search, Calendar } from "lucide-react";
import { CHAIN_NAMES } from "@/constants/chains";
import { Payment } from "@/types/Payments";

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#22d3ee",
  "#f59e42",
  "#f43f5e",
  "#10b981",
  "#f43f5e",
  "#6366f1",
  "#fbbf24",
  "#14b8a6",
];

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
  <div
    className={`${
      bgColor || "bg-white"
    } rounded-lg shadow-sm p-4 border border-gray-100 flex items-center justify-between`}
  >
    <div>
      <p className="text-sm font-medium text-gray-600 mb-0.5">{title}</p>
      <p className="text-xl font-semibold text-gray-900 mt-0.5">{value}</p>
    </div>
    <div className="p-2 rounded-full bg-white">
      <Icon className="h-5 w-5 text-gray-600" />
    </div>
  </div>
);

function groupBy<T, K extends string | number | symbol>(arr: T[], getKey: (item: T) => K): Record<K, T[]> {
  return arr.reduce((acc: Record<K, T[]>, item: T) => {
    const key = getKey(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export default function PlatformRevenuePage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [chainFilter, setChainFilter] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    fetch("/api/platform-revenue")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch platform revenue data");
        const data = await res.json();
        setPayments(data.data.payments || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Stats
  const totalRevenue = useMemo(
    () => payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
    [payments]
  );
  const totalTransactions = payments.length;

  // Revenue change this month vs last month
  const revenueChange = useMemo(() => {
    if (!payments.length)
      return { percent: 0, direction: "none", thisMonth: 0, lastMonth: 0 };
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;
    payments.forEach((p) => {
      const d = new Date(p.createdAt);
      if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
        thisMonthRevenue += Number(p.amount) || 0;
      } else if (
        d.getMonth() === lastMonth &&
        d.getFullYear() === lastMonthYear
      ) {
        lastMonthRevenue += Number(p.amount) || 0;
      }
    });
    const percent =
      lastMonthRevenue === 0
        ? 100
        : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    let direction: "up" | "down" | "none" = "none";
    if (percent > 0) direction = "up";
    else if (percent < 0) direction = "down";
    return {
      percent: Math.abs(percent),
      direction,
      thisMonth: thisMonthRevenue,
      lastMonth: lastMonthRevenue,
    };
  }, [payments]);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // Search
      const matchesSearch =
        searchTerm === "" ||
        p.signature.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.evm_address.toLowerCase().includes(searchTerm.toLowerCase());
      // Date
      let matchesDate = true;
      if (dateRange.start) {
        matchesDate = new Date(p.createdAt) >= new Date(dateRange.start);
      }
      if (matchesDate && dateRange.end) {
        matchesDate = new Date(p.createdAt) <= new Date(dateRange.end);
      }
      // Chain
      const matchesChain = chainFilter === "all" || p.chain_id === chainFilter;
      return matchesSearch && matchesDate && matchesChain;
    });
  }, [payments, searchTerm, dateRange, chainFilter]);

  // Revenue by chain
  const revenueByChain = useMemo(() => {
    const grouped = groupBy(payments, (p) => p.chain_id);
    return Object.entries(grouped).map(([chain, items], idx) => ({
      chain: CHAIN_NAMES[Number(chain)] || chain,
      value: items.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
      color: COLORS[idx % COLORS.length],
    }));
  }, [payments]);

  // Revenue over time (by day)
  const revenueOverTime = useMemo(() => {
    const byDay: Record<string, number> = {};
    payments.forEach((p) => {
      const date = new Date(p.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      byDay[date] = (byDay[date] || 0) + (Number(p.amount) || 0);
    });
    // Sort by date ascending
    return Object.entries(byDay)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, revenue]) => ({ date, revenue }));
  }, [payments]);

  return (
    <PageState loading={loading} error={error}>
      <DashboardLayout>
        <DashboardHeader
          title="Platform Revenue Analytics"
          subtitle="Visualize and track platform revenue from all payments."
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            bgColor="bg-blue-50"
          />
          <StatsCard
            title="Total Transactions"
            value={totalTransactions}
            icon={Layers}
            bgColor="bg-green-50"
          />
          <div className="rounded-lg shadow-sm p-4 border border-gray-100 flex items-center justify-between bg-orange-50">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-0.5">Growth</p>
              <p className="text-xl font-semibold text-gray-900 mt-0.5 flex items-center">
                {revenueChange.lastMonth === 0 &&
                revenueChange.thisMonth === 0 ? (
                  <span>No recent revenue</span>
                ) : revenueChange.lastMonth === 0 ? (
                  <span>New revenue</span>
                ) : (
                  <>
                    {revenueChange.direction === "up" && (
                      <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                    )}
                    {revenueChange.direction === "down" && (
                      <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    {revenueChange.percent.toFixed(1)}%
                    <span className="ml-2 text-xs text-gray-500">
                      vs last month
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="p-2 rounded-full bg-white">
              {revenueChange.lastMonth === 0 &&
              revenueChange.thisMonth === 0 ? (
                <TrendingDown className="h-5 w-5 text-gray-400" />
              ) : revenueChange.lastMonth === 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : revenueChange.direction === "up" ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
          </div>
          <div className="rounded-lg shadow-sm p-4 border border-gray-100 flex items-center justify-between bg-purple-50">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-0.5">
                This Month
              </p>
              <p className="text-xl font-semibold text-gray-900 mt-0.5">
                ${revenueChange.thisMonth.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Last Month: ${revenueChange.lastMonth.toLocaleString()}
              </p>
            </div>
            <div className="p-2 rounded-full bg-white">
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Revenue by Chain and Revenue Over Time Charts Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue by Chain Pie Chart */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium mb-4">Revenue by Chain</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByChain}
                    dataKey="value"
                    nameKey="chain"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ chain, percent }) =>
                      `${chain} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {revenueByChain.map((entry, idx) => (
                      <Cell key={`cell-chain-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `$${Number(value).toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Over Time Chart */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium mb-4">Revenue Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueOverTime}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `$${Number(value).toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: "#6366f1", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#6366f1" }}
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by signature or address"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-2 items-center">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="date"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="date"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
              />
            </div>
            <button
              onClick={() => setDateRange({ start: "", end: "" })}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              All Time
            </button>
          </div>
          <div className="min-w-[160px]">
            <Select value={chainFilter} onValueChange={setChainFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Chains" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                {Array.from(new Set(payments.map((p) => p.chain_id))).map(
                  (chain) => (
                    <SelectItem key={chain} value={chain}>
                      {CHAIN_NAMES[Number(chain)] || chain}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-medium mb-4">All Payments</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Signature</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Chain</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((p, idx) => (
                  <TableRow key={p.signature + idx}>
                    <TableCell
                      className="truncate max-w-xs"
                      title={p.signature}
                    >
                      {p.signature.slice(0, 10)}...{p.signature.slice(-6)}
                    </TableCell>
                    <TableCell
                      className="truncate max-w-xs"
                      title={p.evm_address}
                    >
                      {p.evm_address.slice(0, 8)}...{p.evm_address.slice(-6)}
                    </TableCell>
                    <TableCell>${Number(p.amount).toLocaleString()}</TableCell>
                    <TableCell>{p.token}</TableCell>
                    <TableCell>
                      {CHAIN_NAMES[Number(p.chain_id)] || p.chain_id}
                    </TableCell>
                    <TableCell>
                      {new Date(p.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredPayments.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No payments found matching your filters.
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </PageState>
  );
}
