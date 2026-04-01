import { NextRequest, NextResponse } from "next/server";
import { listStockMovements, getStockStats } from "@/features/stock/service";
import { StockMovementType } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type");

  if (type === "stats") {
    const stats = await getStockStats();
    return NextResponse.json(stats);
  }

  const page = Number(params.get("page") || "1");
  const perPage = Number(params.get("perPage") || "20");
  const search = params.get("search") || undefined;
  const movementType = (params.get("movementType") as StockMovementType) || undefined;

  const result = await listStockMovements({
    page,
    perPage,
    type: movementType,
    search,
  });

  return NextResponse.json(result);
}
