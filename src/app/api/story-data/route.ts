import { NextResponse } from "next/server";
import { StoryDataResponse } from "@/types/StoryData";
import { API } from "../config";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const ipType = searchParams.get("ipType") || "all";
    const chainId = searchParams.get("chainId") || "all";

    // If frontend is requesting a specific page, just forward the request
    if (page > 1) {
      // Build query parameters for the backend API
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
      if (ipType !== "all") queryParams.append("ipType", ipType);
      if (chainId !== "all") queryParams.append("chainId", chainId);

      // Fetch data from the backend API
      const apiUrl = `${API}/story/ip-assets-stats?${queryParams.toString()}`;
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Backend API responded with status: ${response.status}`);
      }

      const data: StoryDataResponse = await response.json();
      return NextResponse.json(data);
    }

    // If requesting page 1 or no page specified, fetch all data
    let allStats: StoryDataResponse["data"]["stats"] = [];
    let currentPage = 1;
    let hasMorePages = true;
    const maxLimit = 100; // Use maximum limit to reduce number of requests

    while (hasMorePages) {
      // Build query parameters for the backend API
      const queryParams = new URLSearchParams();
      queryParams.append("page", currentPage.toString());
      queryParams.append("limit", maxLimit.toString());
      if (ipType !== "all") queryParams.append("ipType", ipType);
      if (chainId !== "all") queryParams.append("chainId", chainId);

      // Fetch data from the backend API
      const apiUrl = `${API}/story/ip-assets-stats?${queryParams.toString()}`;
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Backend API responded with status: ${response.status}`);
      }

      const data: StoryDataResponse = await response.json();
      
      // Add stats from this page to our collection
      allStats = [...allStats, ...data.data.stats];

      // Check if there are more pages
      hasMorePages = data.data.pages.nextPage !== null;
      currentPage++;

      // Safety check to prevent infinite loops
      if (currentPage > 1000) {
        console.warn("Reached maximum page limit (1000) - stopping pagination");
        break;
      }
    }

    // Return aggregated data
    const response: StoryDataResponse = {
      status: "success",
      code: 200,
      data: {
        stats: allStats,
        totalCount: allStats.length,
        pages: {
          currentPage: 1,
          nextPage: null
        },
        filters: {
          ipType,
          chainId
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching story data:", error);
    return NextResponse.json(
      { error: "Failed to fetch story data" },
      { status: 500 }
    );
  }
} 