import { NextRequest, NextResponse } from "next/server";
import { listExpenses, getExpenseStats } from "@/features/expenses/service";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type");

  if (type === "stats") {
    const stats = await getExpenseStats();
    return NextResponse.json(stats);
  }

  const page = Number(params.get("page") || "1");
  const perPage = Number(params.get("perPage") || "20");
  const search = params.get("search") || undefined;
  const category = params.get("category") || undefined;

  const result = await listExpenses({ page, perPage, search, category });
  return NextResponse.json(result);
}
