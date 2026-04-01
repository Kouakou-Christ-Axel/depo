import { NextRequest, NextResponse } from "next/server";
import { listSales } from "@/features/sales/service";
import { SaleStatus } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const page = Number(params.get("page") || "1");
  const perPage = Number(params.get("perPage") || "20");
  const search = params.get("search") || undefined;
  const status = (params.get("status") as SaleStatus) || undefined;
  const clientId = params.get("clientId") || undefined;

  const result = await listSales({ page, perPage, search, status, clientId });

  return NextResponse.json(result);
}
