"use client";

import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, parseAsBoolean, useQueryState } from "nuqs";
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
  HandCoins,
} from "lucide-react";
import { PaymentDialog } from "./payment-dialog";
import Link from "next/link";

interface ClientRow {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  debtTotal: number;
  salesCount: number;
  lastPaymentDate: string | null;
  lastPaymentAmount: number | null;
}

interface ApiClient {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  debtTotal: string;
  salesCount: number;
  lastPayment: {
    id: string;
    amount: string;
    method: string | null;
    paymentDate: string;
  } | null;
}

interface PaginatedResponse {
  data: ApiClient[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export function ClientsView() {
  const queryClient = useQueryClient();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [debtOnly, setDebtOnly] = useQueryState("dette", parseAsBoolean.withDefault(false));
  const [paymentClient, setPaymentClient] = useState<{ id: string; name: string; debt: number } | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ["clients-list", page, search, debtOnly],
    queryFn: async (): Promise<PaginatedResponse> => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("perPage", "20");
      if (search) params.set("search", search);
      if (debtOnly) params.set("debtOnly", "true");
      const res = await fetch(`/api/clients?${params}`);
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  const rows: ClientRow[] = (response?.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    debtTotal: Number(c.debtTotal),
    salesCount: c.salesCount,
    lastPaymentDate: c.lastPayment?.paymentDate ?? null,
    lastPaymentAmount: c.lastPayment ? Number(c.lastPayment.amount) : null,
  }));

  const columns: ColumnDef<ClientRow>[] = [
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <Link href={`/clients/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      accessorKey: "phone",
      header: "Téléphone",
      cell: ({ row }) => row.getValue("phone") || "—",
    },
    {
      accessorKey: "salesCount",
      header: () => <div className="text-right">Ventes</div>,
      cell: ({ row }) => <div className="text-right">{row.getValue("salesCount")}</div>,
    },
    {
      accessorKey: "debtTotal",
      header: () => <div className="text-right">Dette</div>,
      cell: ({ row }) => {
        const debt = row.getValue("debtTotal") as number;
        if (debt <= 0) return <div className="text-right text-muted-foreground">—</div>;
        return (
          <div className="text-right">
            <Badge variant="destructive">
              {debt.toLocaleString("fr-FR")} FCFA
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "lastPaymentDate",
      header: "Dernier paiement",
      cell: ({ row }) => {
        const date = row.getValue("lastPaymentDate") as string | null;
        const amount = row.original.lastPaymentAmount;
        if (!date) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="text-sm">
            <span>{new Date(date).toLocaleDateString("fr-FR")}</span>
            {amount && (
              <span className="text-muted-foreground ml-1">
                ({amount.toLocaleString("fr-FR")} FCFA)
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Action</div>,
      cell: ({ row }) => {
        const debt = row.original.debtTotal;
        if (debt <= 0) return null;
        return (
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPaymentClient({
                  id: row.original.id,
                  name: row.original.name,
                  debt,
                })
              }
            >
              <HandCoins className="h-3 w-3 mr-1" />
              Encaisser
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: response?.totalPages ?? 0,
  });

  const handlePaymentSuccess = useCallback(() => {
    setPaymentClient(null);
    queryClient.invalidateQueries({ queryKey: ["clients-list"] });
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Rechercher par nom ou téléphone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value || null);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <Button
            variant={debtOnly ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setDebtOnly(!debtOnly || null);
              setPage(1);
            }}
          >
            <HandCoins className="h-3 w-3 mr-1" />
            {debtOnly ? "Tous les clients" : "Clients endettés"}
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id}>
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
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
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    Aucun client trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{response?.total ?? 0} client(s)</p>
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

      <PaymentDialog
        open={!!paymentClient}
        client={paymentClient}
        onClose={() => setPaymentClient(null)}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
