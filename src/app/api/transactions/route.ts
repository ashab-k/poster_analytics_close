import { NextResponse } from "next/server";
import { API } from "../config";
export async function GET() {
  try {
    const data = await fetch(`${API}/analytics/transactions`);
    console.log("API URL:", `${API}/analytics/transactions`);

    const txsByChain = await data.json();
    console.log(txsByChain);
    return NextResponse.json(txsByChain);
  } catch (error) {
    return NextResponse.json({ error, status: 500 });
  }
}
