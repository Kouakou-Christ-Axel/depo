"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface MovementRow {
  id: string;
  type: string;
  quantityHalf: number;
  stockAfter: number;
  notes: string | null;
  createdAt: string;
  productName: string;
  variantName: string;
  createdByName: string;
}

const typeConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  IN: { label: "Entrée", variant: "default" },
  OUT: { label: "Sortie", variant: "outline" },
  LOSS: { label: "Perte", variant: "destructive" },
  ADJUSTMENT: { label: "Ajustement", variant: "secondary" },
};

const columns: ColumnDef<MovementRow>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.getValue("createdAt")).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const t = row.getValue("type") as string;
      const cfg = typeConfig[t] || { label: t, variant: "secondary" as const };
      return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
    },
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
    accessorKey: "quantityHalf",
    header: () => <div className="text-right">Quantité</div>,
    cell: ({ row }) => {
      const qty = row.getValue("quantityHalf") as number;
      const casiers = qty / 2;
      const isPositive = qty > 0;
      return (
        <div
          className={`text-right font-medium ${isPositive ? "text-green-600" : "text-destructive"}`}
        >
          {isPositive ? "+" : ""}
          {casiers.toFixed(1)} casiers
        </div>
      );
    },
  },
  {
    accessorKey: "stockAfter",
    header: () => <div className="text-right">Stock après</div>,
    cell: ({ row }) => (
      <div className="text-right text-muted-foreground">
        {((row.getValue("stockAfter") as number) / 2).toFixed(1)} casiers
      </div>
    ),
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-sm text-muted-foreground">
        {row.getValue("notes") || "—"}
      </div>
    ),
  },
  {
    accessorKey: "createdByName",
    header: "Par",
  },
];

interface PaginatedResponse {
  data: MovementRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export function StockMovementsView() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [typeFilter, setTypeFilter] = useQueryState(
    "type",
    parseAsString.withDefault("")
  );

  const { data: response, isLoading } = useQuery({
    queryKey: ["stock-movements", page, search, typeFilter],
    queryFn: async (): Promise<PaginatedResponse> => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("perPage", "20");
      if (search) params.set("search", search);
      if (typeFilter) params.set("movementType", typeFilter);
      const res = await fetch(`/api/stock?${params}`);
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  const table = useReactTable({
    data: response?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: response?.totalPages ?? 0,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Rechercher par produit ou note..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value || null);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <select
          className="flex h-9 w-full sm:w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value || null);
            setPage(1);
          }}
        >
          <option value="">Tous les types</option>
          <option value="IN">Entrées</option>
          <option value="OUT">Sorties</option>
          <option value="LOSS">Pertes</option>
          <option value="ADJUSTMENT">Ajustements</option>
        </select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
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
                  Aucun mouvement trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {response?.total ?? 0} mouvement(s)
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(1)} disabled={page <= 1}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(page - 1)} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">Page {page} sur {response?.totalPages ?? 1}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(page + 1)} disabled={page >= (response?.totalPages ?? 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(response?.totalPages ?? 1)} disabled={page >= (response?.totalPages ?? 1)}>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
