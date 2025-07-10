import { NextResponse } from "next/server";
import { API } from "../config";

export async function GET() {
  try {
    let allPayments: {
      amount: number | string;
      createdAt: string;
      signature: string;
      evm_address: string;
      chain_id: string | number;
      token?: string;
    }[] = [];
    let currentPage = 1;
    let hasNextPage = true;
    const maxLimit = 100;

    while (hasNextPage) {
      const queryParams = new URLSearchParams();
      queryParams.append("page", currentPage.toString());
      queryParams.append("limit", maxLimit.toString());

      const apiUrl = `${API}/points/all-payments?${queryParams.toString()}`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Backend API responded with status: ${response.status}`
        );
      }

      const data = await response.json();
      if (
        data.status !== "success" ||
        !data.data ||
        !Array.isArray(data.data.payments)
      ) {
        throw new Error("Invalid data format received from server");
      }

      allPayments = [...allPayments, ...data.data.payments];
      hasNextPage =
        data.data.pagination && data.data.pagination.nextPage !== null;
      if (hasNextPage) {
        currentPage = data.data.pagination.nextPage;
      }
    }

    return NextResponse.json({
      status: "success",
      code: 200,
      data: {
        payments: allPayments,
        totalCount: allPayments.length,
      },
    });
  } catch (error) {
    console.error("Error fetching platform revenue payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform revenue payments" },
      { status: 500 }
    );
  }
}
