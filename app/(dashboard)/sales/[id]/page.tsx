import { notFound } from "next/navigation";
import { getSaleById } from "@/features/sales/service";
import { SaleDetail } from "./components/sale-detail";

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sale = await getSaleById(id);

  if (!sale) notFound();

  const data = {
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
  };

  return <SaleDetail sale={data} />;
}
