import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "@/features/products/service";
import { listVariants } from "@/features/products/service";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type");

  if (type === "variants") {
    const variants = await listVariants();
    return NextResponse.json(variants);
  }

  const includeInactive = params.get("includeInactive") === "true";
  const products = await listProducts(includeInactive);

  // Serialize Decimal fields to numbers for JSON
  const serialized = JSON.parse(
    JSON.stringify(products, (_key, value) =>
      typeof value === "object" && value !== null && "toFixed" in value
        ? Number(value)
        : value
    )
  );

  return NextResponse.json(serialized);
}
