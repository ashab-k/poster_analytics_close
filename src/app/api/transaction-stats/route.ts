import { NextResponse } from "next/server";
import { API } from "../config";

export async function GET() {
  try {
    const response = await fetch(`${API}/analytics/transaction-metrics`);
    if (!response.ok) {
      throw new Error("Failed to fetch transaction stats");
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    return NextResponse.json({ error: "Failed to fetch transaction stats" }, { status: 500 });
  }
} 