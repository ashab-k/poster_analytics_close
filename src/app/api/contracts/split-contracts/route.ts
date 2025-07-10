import { NextRequest, NextResponse } from "next/server";
import { API } from "../../config";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const chainId = searchParams.get("chainId");
    const userId = searchParams.get("userId");

    // Build query string for backend API
    const queryParams = new URLSearchParams({
      page,
      limit,
    });

    // Add optional filters if they exist
    if (chainId) {
      queryParams.append("chainId", chainId);
    }
    if (userId) {
      queryParams.append("userId", userId);
    }

    const response = await fetch(
      `${API}/contracts/split-contracts?${queryParams}`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch split contracts: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching split contracts:", error);

    return NextResponse.json(
      {
        message: "Error fetching split contracts",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
