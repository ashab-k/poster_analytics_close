import { NextResponse } from "next/server";
import { API } from "../config";
export async function GET() {
  try {
    const response = await fetch(`${API}/analytics/users`);
    const allUsersInfo = await response.json();
    return NextResponse.json(allUsersInfo);
  } catch (error) {
    return NextResponse.json({ error, status: 500 });
  }
}
