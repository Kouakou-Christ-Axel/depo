import { NextRequest, NextResponse } from "next/server";
import { getAnalytics } from "@/features/reports/analytics";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const start = params.get("start");
  const end = params.get("end");

  if (!start || !end) {
    return NextResponse.json(
      { error: "start et end sont requis" },
      { status: 400 }
    );
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  const data = await getAnalytics(startDate, endDate);
  return NextResponse.json(data);
}
