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
import { EXPENSE_CATEGORIES } from "@/lib/constants";

interface ExpenseRow {
  id: string;
  category: string;
  description: string;
  amount: number;
  expenseDate: string;
  createdByName: string;
}

const columns: ColumnDef<ExpenseRow>[] = [
  {
    accessorKey: "expenseDate",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.getValue("expenseDate")).toLocaleDateString("fr-FR"),
  },
  {
    accessorKey: "category",
    header: "Catégorie",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("category")}</Badge>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate">
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Montant</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {Number(row.getValue("amount")).toLocaleString("fr-FR")} FCFA
      </div>
    ),
  },
  {
    accessorKey: "createdByName",
    header: "Par",
  },
];

interface PaginatedResponse {
  data: {
    id: string;
    category: string;
    description: string;
    amount: string;
    expenseDate: string;
    createdByName: string;
  }[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export function ExpensesView() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [category, setCategory] = useQueryState(
    "cat",
    parseAsString.withDefault("")
  );

  const { data: response, isLoading } = useQuery({
    queryKey: ["expenses", page, search, category],
    queryFn: async (): Promise<PaginatedResponse> => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("perPage", "20");
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      const res = await fetch(`/api/expenses?${params}`);
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  const rows: ExpenseRow[] = (response?.data ?? []).map((e) => ({
    ...e,
    amount: Number(e.amount),
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
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Rechercher par description..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value || null);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <select
          className="flex h-9 w-full sm:w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value || null);
            setPage(1);
          }}
        >
          <option value="">Toutes catégories</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
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
                  Aucune dépense trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {response?.total ?? 0} dépense(s)
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
