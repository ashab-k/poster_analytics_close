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

function groupBy<T, K extends string | number | symbol>(
  arr: T[],
  getKey: (item: T) => K
): Record<K, T[]> {
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

  // Revenue over time (by day, cumulative)
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
    const sorted = Object.entries(byDay)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
    let cumulative = 0;
    return sorted.map(([date, revenue]) => {
      cumulative += revenue;
      return { date, revenue: cumulative };
    });
  }, [payments]);

  return (
    <PageState loading={loading} error={error}>
      <DashboardLayout>
        <DashboardHeader
          title="Platform Revenue Analytics"
          subtitle="Visualize and track platform revenue from all payments."
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

          <div className="rounded-lg shadow-sm p-4 border border-gray-100 flex items-center justify-between bg-purple-50">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-0.5">
                This Month
              </p>
              <p className="text-xl font-semibold text-gray-900 mt-0.5">$273</p>
              <p className="text-xs text-gray-500">Last Month: $564</p>
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
      </DashboardLayout>
    </PageState>
  );
}
