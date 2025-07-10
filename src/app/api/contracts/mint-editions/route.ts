import { NextResponse } from "next/server";
import { API } from "../../config";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";

    const response = await fetch(
      `${API}/contracts/mint-editions?page=${page}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();

    // Validate the response structure
    if (!data || !data.data || !Array.isArray(data.data.contracts)) {
      throw new Error("Invalid data format received from server");
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching mint editions:", error);
    return NextResponse.json(
      { error: "Failed to fetch mint editions" },
      { status: 500 }
    );
  }
}
