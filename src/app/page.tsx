// app/dashboard/analytics/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Users, Activity, Share2, TrendingUp } from "lucide-react";
import { UserAnalytics } from "@/types/User";
import { UserStatsCard } from "@/components/users/UserStatsCard";
import { UserGrowthChart } from "@/components/users/UserGrowthChart";
import { SocialConnectionsChart } from "@/components/users/SocialConnectionsChart";
import { UserEngagementCard } from "@/components/users/UserEngagementCard";
import { DashboardLayout } from "@/components/users/DashboardLayout";
import { DashboardHeader } from "@/components/users/DashboardHeader";
import { PageState } from "@/components/ui/PageState";

// Cache configuration
const CACHE_KEY = "user_analytics_cache";
const CACHE_EXPIRY = 12 * 60 * 60 * 1000;

interface CacheData {
  data: UserAnalytics;
  timestamp: number;
}

export default function UserAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<UserAnalytics | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Check cache first
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp }: CacheData = JSON.parse(cachedData);
          const isExpired = Date.now() - timestamp > CACHE_EXPIRY;

          if (!isExpired) {
            setAnalyticsData(data);
            setError(null);
            setIsLoading(false);
            return;
          }
        }

        // If no cache or expired, fetch new data
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();

        // Validate the data before processing
        if (!data || typeof data !== "object") {
          throw new Error("Invalid data received from server");
        }

        // Process the data
        const processedData = {
          totalUsers: data.totalUsers,
          userGrowth: data.userGrowth || [],
          engagement: {
            usersWithCanvases: data.engagement?.usersWithCanvases,
            usersWithPublishedCanvases:
              data.engagement?.usersWithPublishedCanvases,
            activeUsersLast30Days: data.engagement?.activeUsersLast30Days,
            activityLevels: {
              low_activity: data.engagement?.activityLevels?.low_activity,
              medium_activity: data.engagement?.activityLevels?.medium_activity,
              high_activity: data.engagement?.activityLevels?.high_activity,
            },
          },
          walletDistribution: {
            evm_users: data.walletDistribution?.evm_users,
            solana_users: data.walletDistribution?.solana_users,
            both_wallets: data.walletDistribution?.both_wallets,
          },
          socialConnections: {
            farcaster_users: data.socialConnections?.farcaster_users,
            lens_users: data.socialConnections?.lens_users,
            twitter_users: data.socialConnections?.twitter_users,
            usersWithMultipleSocials:
              data.socialConnections?.usersWithMultipleSocials,
          },
        };

        // Validate processed data
        if (!processedData.totalUsers || !processedData.userGrowth) {
          throw new Error("Required data fields are missing");
        }

        // Only cache if we have valid data
        const cacheData: CacheData = {
          data: processedData,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

        setAnalyticsData(processedData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load analytics data. Please try again later."
        );
        console.error(err);
        // Clear invalid cache if it exists
        localStorage.removeItem(CACHE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate monthly user growth for trend indicator
  const calculateMonthlyGrowth = () => {
    if (!analyticsData?.userGrowth || analyticsData.userGrowth.length < 2)
      return 0;

    const lastMonth =
      analyticsData.userGrowth[analyticsData.userGrowth.length - 1];
    const previousMonth =
      analyticsData.userGrowth[analyticsData.userGrowth.length - 2];

    if (previousMonth.count === 0) return 100;

    return Math.round(
      ((lastMonth.count - previousMonth.count) / previousMonth.count) * 100
    );
  };

  const monthlyGrowthRate = calculateMonthlyGrowth();

  // Only render the dashboard content when we have data
  const renderDashboard = () => {
    if (!analyticsData) return null;

    return (
      <DashboardLayout>
        <DashboardHeader
          title="User Analytics"
          subtitle="Track and analyze user growth and engagement metrics"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <UserStatsCard
            title="Total Users"
            value={analyticsData.totalUsers}
            icon={Users}
            bgColor="bg-blue-50"
          />
          <UserStatsCard
            title="New Users This Month"
            value={
              analyticsData.userGrowth[analyticsData.userGrowth.length - 1]
                ?.count || 0
            }
            icon={TrendingUp}
            trend={monthlyGrowthRate}
            trendLabel="vs last month"
            bgColor="bg-green-50"
          />
          <UserStatsCard
            title="Active Users (30d)"
            value={analyticsData.engagement.activeUsersLast30Days}
            icon={Activity}
            bgColor="bg-purple-50"
          />
          <UserStatsCard
            title="Social Connections"
            value={
              analyticsData.socialConnections.farcaster_users +
              analyticsData.socialConnections.lens_users +
              analyticsData.socialConnections.twitter_users
            }
            icon={Share2}
            bgColor="bg-indigo-50"
          />
        </div>
        <div className="gap-6 mb-6">
          {" "}
          <UserGrowthChart data={analyticsData.userGrowth} />
        </div>
        <div className="gap-6 mb-6"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserEngagementCard
            data={analyticsData.engagement}
            totalUsers={analyticsData.totalUsers}
          />
          <SocialConnectionsChart data={analyticsData.socialConnections} />
        </div>
      </DashboardLayout>
    );
  };

  return (
    <PageState
      loading={isLoading}
      error={error || (!analyticsData ? "No data available" : null)}
      loadingProps={{ message: "Loading analytics data..." }}
      errorProps={{ onRetry: () => window.location.reload() }}
    >
      {renderDashboard()}
    </PageState>
  );
}
