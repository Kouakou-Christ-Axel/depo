import { NextRequest, NextResponse } from "next/server";
import {
  listSuppliers,
  listAllActiveSuppliers,
} from "@/features/suppliers/service";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type");

  // Simple list for selects
  if (type === "all") {
    const suppliers = await listAllActiveSuppliers();
    return NextResponse.json(suppliers);
  }

  // Paginated list
  const page = Number(params.get("page") || "1");
  const perPage = Number(params.get("perPage") || "20");
  const search = params.get("search") || undefined;
  const includeInactive = params.get("includeInactive") === "true";

  const result = await listSuppliers({
    page,
    perPage,
    search,
    includeInactive,
  });

  return NextResponse.json(result);
}
