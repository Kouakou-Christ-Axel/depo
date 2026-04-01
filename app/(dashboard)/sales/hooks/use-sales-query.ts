import { useQuery } from "@tanstack/react-query";

export interface SaleRow {
  id: string;
  saleNumber: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
  remaining: number;
  clientName: string | null;
  itemsSummary: string;
  itemsCount: number;
  createdByName: string;
  createdAt: string;
}

interface ApiSaleItem {
  quantityHalf: number;
  subtotal: string;
  productVariant: {
    product: { name: string };
    variant: { name: string };
  };
}

interface ApiSale {
  id: string;
  saleNumber: string;
  status: string;
  totalAmount: string;
  amountPaid: string;
  createdAt: string;
  items: ApiSaleItem[];
  client: { name: string } | null;
  createdBy: { name: string | null; email: string };
}

interface PaginatedResponse {
  data: ApiSale[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

interface UseSalesQueryParams {
  page: number;
  search: string;
  status: string;
}

export function useSalesQuery({ page, search, status }: UseSalesQueryParams) {
  return useQuery({
    queryKey: ["sales", page, search, status],
    queryFn: async (): Promise<{
      rows: SaleRow[];
      total: number;
      totalPages: number;
    }> => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("perPage", "20");
      if (search) params.set("search", search);
      if (status) params.set("status", status);

      const res = await fetch(`/api/sales?${params}`);
      if (!res.ok) throw new Error("Erreur chargement ventes");

      const json: PaginatedResponse = await res.json();

      const rows: SaleRow[] = json.data.map((sale) => {
        const totalAmount = Number(sale.totalAmount);
        const amountPaid = Number(sale.amountPaid);

        const itemsSummary = sale.items
          .map(
            (item) =>
              `${item.productVariant.product.name} ${item.productVariant.variant.name} x${item.quantityHalf / 2}`
          )
          .join(", ");

        return {
          id: sale.id,
          saleNumber: sale.saleNumber,
          status: sale.status,
          totalAmount,
          amountPaid,
          remaining: totalAmount - amountPaid,
          clientName: sale.client?.name ?? null,
          itemsSummary,
          itemsCount: sale.items.length,
          createdByName: sale.createdBy.name || sale.createdBy.email,
          createdAt: sale.createdAt,
        };
      });

      return { rows, total: json.total, totalPages: json.totalPages };
    },
  });
}
