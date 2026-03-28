import { NextRequest, NextResponse } from "next/server";
import { listPurchases } from "@/features/purchases/service";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const page = Number(params.get("page") || "1");
  const perPage = Number(params.get("perPage") || "20");
  const search = params.get("search") || undefined;
  const productVariantId = params.get("productVariantId") || undefined;
  const supplierName = params.get("supplierName") || undefined;

  const result = await listPurchases({
    page,
    perPage,
    search,
    productVariantId,
    supplierName,
  });

  return NextResponse.json(result);
}
