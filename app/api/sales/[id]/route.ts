import { NextRequest, NextResponse } from "next/server";
import { getSaleById } from "@/features/sales/service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sale = await getSaleById(id);

  if (!sale) {
    return NextResponse.json({ error: "Vente introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    id: sale.id,
    saleNumber: sale.saleNumber,
    status: sale.status,
    totalAmount: Number(sale.totalAmount),
    amountPaid: Number(sale.amountPaid),
    notes: sale.notes,
    createdAt: sale.createdAt.toISOString(),
    client: sale.client,
    createdBy: sale.createdBy,
    items: sale.items.map((item) => ({
      id: item.id,
      productName: item.productVariant.product.name,
      variantName: item.productVariant.variant.name,
      quantityHalf: item.quantityHalf,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
    })),
  });
}
