"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type PurchaseRow = {
  id: string;
  productName: string;
  variantName: string;
  supplierName: string | null;
  invoiceNumber: string | null;
  quantityCasier: number;
  purchasePriceCasier: number;
  totalAmount: number;
  createdByName: string;
  createdAt: string;
};

const columns: ColumnDef<PurchaseRow>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.getValue("createdAt")).toLocaleDateString("fr-FR"),
  },
  {
    accessorKey: "productName",
    header: "Produit",
    cell: ({ row }) => (
      <div>
        <span className="font-medium">{row.original.productName}</span>
        <span className="text-muted-foreground text-xs ml-1">
          {row.original.variantName}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "supplierName",
    header: "Fournisseur",
    cell: ({ row }) => row.getValue("supplierName") || "—",
  },
  {
    accessorKey: "invoiceNumber",
    header: "N° Facture",
    cell: ({ row }) => row.getValue("invoiceNumber") || "—",
  },
  {
    accessorKey: "quantityCasier",
    header: () => <div className="text-right">Qté (casiers)</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("quantityCasier")}</div>
    ),
  },
  {
    accessorKey: "purchasePriceCasier",
    header: () => <div className="text-right">Prix/casier</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {Number(row.getValue("purchasePriceCasier")).toLocaleString("fr-FR")}{" "}
        FCFA
      </div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {Number(row.getValue("totalAmount")).toLocaleString("fr-FR")} FCFA
      </div>
    ),
  },
  {
    accessorKey: "createdByName",
    header: "Créé par",
  },
];

interface PaginatedResponse {
  data: Array<{
    id: string;
    supplierName: string | null;
    invoiceNumber: string | null;
    quantityCasier: number;
    purchasePriceCasier: number | string;
    totalAmount: number | string;
    createdAt: string;
    productVariant: {
      product: { name: string };
      variant: { name: string };
    };
    createdBy: { name: string | null; email: string };
  }>;
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export function PurchasesTable() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );

  const { data: response, isLoading } = useQuery({
    queryKey: ["purchases", page, search],
    queryFn: async (): Promise<PaginatedResponse> => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("perPage", "20");
      if (search) params.set("search", search);
      const res = await fetch(`/api/purchases?${params}`);
      if (!res.ok) throw new Error("Erreur chargement achats");
      return res.json();
    },
  });

  const rows: PurchaseRow[] = (response?.data ?? []).map((p) => ({
    id: p.id,
    productName: p.productVariant.product.name,
    variantName: p.productVariant.variant.name,
    supplierName: p.supplierName,
    invoiceNumber: p.invoiceNumber,
    quantityCasier: p.quantityCasier,
    purchasePriceCasier: Number(p.purchasePriceCasier),
    totalAmount: Number(p.totalAmount),
    createdByName: p.createdBy.name || p.createdBy.email,
    createdAt: p.createdAt,
  }));

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: response?.totalPages ?? 0,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Rechercher par fournisseur, facture ou produit..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value || null);
          setPage(1);
        }}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Aucun achat trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {response?.total ?? 0} achat(s) au total
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage(1)}
            disabled={page <= 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {page} sur {response?.totalPages ?? 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage(page + 1)}
            disabled={page >= (response?.totalPages ?? 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage(response?.totalPages ?? 1)}
            disabled={page >= (response?.totalPages ?? 1)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
