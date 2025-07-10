"use client";

import React from "react";
import { DashboardLayout } from "@/components/users/DashboardLayout";
import { DashboardHeader } from "@/components/users/DashboardHeader";
import { PageState } from "@/components/ui/PageState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  PieChart as PieIcon,
  Users,
  Wallet,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// StatsCard component for consistency
const StatsCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
}) => (
  <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
    </div>
    <div className="p-3 rounded-full bg-gray-50">
      <Icon className="h-6 w-6 text-gray-600" />
    </div>
  </div>
);

// Data
const revenueStats = {
  total: 124500,
  primary: 65000,
  royalty: 22000,
  campaigns: 18000,
  monetization: 12000,
};

const revenueBreakdown = [
  { type: "Primary Sales", value: revenueStats.primary },
  { type: "Royalties", value: revenueStats.royalty },
  { type: "Campaigns/Bounties", value: revenueStats.campaigns },
  { type: "Monetization", value: revenueStats.monetization },
];

const chainwiseSplit = [
  { chain: "Ethereum", value: 42000 },
  { chain: "Polygon", value: 56000 },
  { chain: "Base", value: 16500 },
  { chain: "Optimism", value: 10000 },
];

const walletAddresses = [
  { creator: "0xA1B2...C3D4", wallet: "0xA1B2...C3D4" },
  { creator: "0xE5F6...G7H8", wallet: "0xE5F6...G7H8" },
  { creator: "0xI9J0...K1L2", wallet: "0xI9J0...K1L2" },
];

const COLORS = ["#3b82f6", "#8b5cf6", "#22d3ee", "#f59e42"];

// Add top creators data (mocked for now, no Lens users)
const topCreators = [
  {
    rank: 1,
    username: "memelord",
    platform: "Farcaster",
    address: "0xA1B2...C3D4",
    revenue: 32000,
    assets: 12,
    avatar: "/public/globe.svg",
  },
  {
    rank: 2,
    username: "posterqueen",
    platform: "Twitter",
    address: "0xE5F6...G7H8",
    revenue: 21000,
    assets: 8,
    avatar: "/public/window.svg",
  },
  {
    rank: 3,
    username: "bountyhunter",
    platform: "Farcaster",
    address: "0xM3N4...O5P6",
    revenue: 15000,
    assets: 6,
  },
  {
    rank: 4,
    username: "royaltyking",
    platform: "Twitter",
    address: "0xQ7R8...S9T0",
    revenue: 12000,
    assets: 5,
  },
  {
    rank: 5,
    username: "stickerboss",
    platform: "Farcaster",
    address: "0xCCCC...DDDD",
    revenue: 10000,
    assets: 4,
  },
  {
    rank: 6,
    username: "infomaster",
    platform: "Twitter",
    address: "0xEEEE...FFFF",
    revenue: 9500,
    assets: 3,
  },
  {
    rank: 7,
    username: "posterhero",
    platform: "Farcaster",
    address: "0x3333...4444",
    revenue: 8500,
    assets: 2,
  },
  {
    rank: 8,
    username: "aiartist",
    platform: "Twitter",
    address: "0x5555...6666",
    revenue: 8000,
    assets: 2,
  },
  {
    rank: 9,
    username: "royaltypro",
    platform: "Farcaster",
    address: "0x9999...AAAA",
    revenue: 7000,
    assets: 1,
  },
  {
    rank: 10,
    username: "templatequeen",
    platform: "Twitter",
    address: "0xBBBB...CCCC",
    revenue: 6500,
    assets: 1,
  },
];

// Pedestal for top 3 creators (real podium look, no address, no platform)
const Pedestal = ({ creators }: { creators: typeof topCreators }) => (
  <div className="flex justify-center items-end gap-4 w-full max-w-2xl mx-auto py-8">
    {/* 2nd */}
    <div className="flex flex-col items-center w-24">
      <div className="mb-2 text-base font-semibold text-gray-700">
        {creators[1].username}
      </div>
      <div className="mb-1 text-xs text-blue-600 font-bold">
        ${creators[1].revenue.toLocaleString()}
      </div>
      <div className="w-full h-24 flex flex-col justify-end items-center rounded-t-lg bg-gradient-to-t from-gray-300 to-gray-100 border-2 border-gray-400 shadow-md relative">
        <span className="absolute bottom-3 text-3xl font-extrabold text-gray-500">
          2
        </span>
      </div>
    </div>
    {/* 1st */}
    <div className="flex flex-col items-center w-28">
      <div className="mb-2 text-lg font-bold text-gray-900">
        {creators[0].username}
      </div>
      <div className="mb-1 text-sm text-blue-800 font-bold">
        ${creators[0].revenue.toLocaleString()}
      </div>
      <div className="w-full h-28 flex flex-col justify-end items-center rounded-t-lg bg-gradient-to-t from-yellow-400 to-yellow-200 border-2 border-yellow-500 shadow-lg relative">
        <span className="absolute bottom-3 text-4xl font-extrabold text-yellow-700">
          1
        </span>
      </div>
    </div>
    {/* 3rd */}
    <div className="flex flex-col items-center w-20">
      <div className="mb-2 text-base font-semibold text-gray-700">
        {creators[2].username}
      </div>
      <div className="mb-1 text-xs text-blue-600 font-bold">
        ${creators[2].revenue.toLocaleString()}
      </div>
      <div className="w-full h-20 flex flex-col justify-end items-center rounded-t-lg bg-gradient-to-t from-orange-300 to-orange-100 border-2 border-orange-400 shadow-md relative">
        <span className="absolute bottom-3 text-2xl font-extrabold text-orange-600">
          3
        </span>
      </div>
    </div>
  </div>
);

export default function CreatorRevenuePage() {
  const [loading] = React.useState(false);
  const [error] = React.useState<string | null>(null);

  return (
    <PageState loading={loading} error={error}>
      <DashboardLayout>
        <DashboardHeader
          title="Creator Revenue Analytics"
          subtitle="Track how creators earn across sales, royalties, campaigns, and more."
        />

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
          <StatsCard
            title="Total Revenue"
            value={`$${revenueStats.total.toLocaleString()}`}
            icon={DollarSign}
          />
          <StatsCard
            title="Primary Sales"
            value={`$${revenueStats.primary.toLocaleString()}`}
            icon={TrendingUp}
          />
          <StatsCard
            title="Royalties"
            value={`$${revenueStats.royalty.toLocaleString()}`}
            icon={PieIcon}
          />
          <StatsCard
            title="Campaigns/Bounties"
            value={`$${revenueStats.campaigns.toLocaleString()}`}
            icon={Users}
          />
          <StatsCard
            title="Monetization"
            value={`$${revenueStats.monetization.toLocaleString()}`}
            icon={Wallet}
          />
        </div>

        {/* Top Creators Pedestal */}
        <Card className="mb-10 shadow-md bg-white rounded-2xl border-0">
          <CardHeader>
            <CardTitle>Top Creators</CardTitle>
          </CardHeader>
          <CardContent>
            <Pedestal creators={topCreators} />
            <div className="overflow-x-auto mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Assets</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCreators.slice(3).map((creator) => (
                    <TableRow
                      key={creator.address}
                      className="hover:bg-gray-50"
                    >
                      <TableCell>#{creator.rank}</TableCell>
                      <TableCell className="font-semibold">
                        {creator.username}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {creator.address}
                      </TableCell>
                      <TableCell>${creator.revenue.toLocaleString()}</TableCell>
                      <TableCell>{creator.assets}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <Card className="shadow-md bg-white rounded-2xl border-0">
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueBreakdown}
                      dataKey="value"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {revenueBreakdown.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={COLORS[idx % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `$${Number(value).toLocaleString()}`,
                        "Revenue",
                      ]}
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
            </CardContent>
          </Card>
          <Card className="shadow-md bg-white rounded-2xl border-0">
            <CardHeader>
              <CardTitle>Chainwise Split</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chainwiseSplit}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="chain" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [
                        `$${Number(value).toLocaleString()}`,
                        "Revenue",
                      ]}
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "4px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        border: "none",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="value"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      name="Revenue"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Addresses */}
        <Card className="shadow-md bg-white rounded-2xl border-0">
          <CardHeader>
            <CardTitle>Wallet Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creator</TableHead>
                    <TableHead>Wallet Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {walletAddresses.map((w) => (
                    <TableRow key={w.creator}>
                      <TableCell className="font-mono">{w.creator}</TableCell>
                      <TableCell className="font-mono">{w.wallet}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    </PageState>
  );
}
