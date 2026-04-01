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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { SupplierDetailDialog } from "./supplier-detail-dialog";

type SupplierRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
};

const columns: ColumnDef<SupplierRow>[] = [
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "phone",
    header: "Téléphone",
    cell: ({ row }) => row.getValue("phone") || "—",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.getValue("email") || "—",
  },
  {
    accessorKey: "address",
    header: "Adresse",
    cell: ({ row }) => row.getValue("address") || "—",
  },
  {
    accessorKey: "isActive",
    header: () => <div className="text-right">Statut</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
          {row.getValue("isActive") ? "Actif" : "Inactif"}
        </Badge>
      </div>
    ),
  },
];

function makeColumns(onView: (row: SupplierRow) => void): ColumnDef<SupplierRow>[] {
  return [
    ...columns,
    {
      id: "actions",
      header: () => <div className="text-right">Action</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(row.original)}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}

interface PaginatedResponse {
  data: SupplierRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export function SuppliersTable() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );
  const [selected, setSelected] = useState<SupplierRow | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ["suppliers", page, search],
    queryFn: async (): Promise<PaginatedResponse> => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("perPage", "20");
      params.set("includeInactive", "true");
      if (search) params.set("search", search);
      const res = await fetch(`/api/suppliers?${params}`);
      if (!res.ok) throw new Error("Erreur chargement fournisseurs");
      return res.json();
    },
  });

  const columnsWithActions = makeColumns(setSelected);

  const table = useReactTable({
    data: response?.data ?? [],
    columns: columnsWithActions,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: response?.totalPages ?? 0,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <>
    <div className="space-y-4">
      <Input
        placeholder="Rechercher un fournisseur..."
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
                  colSpan={columnsWithActions.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Aucun fournisseur trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {response?.total ?? 0} fournisseur(s)
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
    <SupplierDetailDialog
      supplier={selected}
      open={!!selected}
      onClose={() => setSelected(null)}
    />
    </>
  );
}
