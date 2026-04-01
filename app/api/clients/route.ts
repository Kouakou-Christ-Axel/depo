import { NextRequest, NextResponse } from "next/server";
import {
  listClients,
  listClientsPaginated,
} from "@/features/clients/service";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type");

  // Simple list for selects
  if (type === "all") {
    const clients = await listClients();
    return NextResponse.json(
      clients.map((c) => ({ id: c.id, name: c.name }))
    );
  }

  // Paginated list
  const page = Number(params.get("page") || "1");
  const perPage = Number(params.get("perPage") || "20");
  const search = params.get("search") || undefined;
  const debtOnly = params.get("debtOnly") === "true";

  const result = await listClientsPaginated({
    page,
    perPage,
    search,
    debtOnly,
  });

  return NextResponse.json(result);
}
