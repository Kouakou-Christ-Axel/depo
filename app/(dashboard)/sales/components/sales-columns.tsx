"use client";

import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Printer } from "lucide-react";
import type { SaleRow } from "../hooks/use-sales-query";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PAID: { label: "Payée", variant: "default" },
  PARTIAL: { label: "Partielle", variant: "outline" },
  UNPAID: { label: "Impayée", variant: "destructive" },
  CANCELLED: { label: "Annulée", variant: "secondary" },
};

const baseColumns: ColumnDef<SaleRow>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.getValue("createdAt")).toLocaleDateString("fr-FR"),
  },
  {
    accessorKey: "saleNumber",
    header: "N° Vente",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("saleNumber")}</span>
    ),
  },
  {
    accessorKey: "clientName",
    header: "Client",
    cell: ({ row }) => row.getValue("clientName") || "Comptoir",
  },
  {
    accessorKey: "itemsSummary",
    header: "Articles",
    cell: ({ row }) => (
      <div className="max-w-[250px] truncate text-sm text-muted-foreground" title={row.getValue("itemsSummary")}>
        {row.original.itemsCount} article(s)
        <span className="hidden sm:inline"> — {row.getValue("itemsSummary")}</span>
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
    accessorKey: "remaining",
    header: () => <div className="text-right">Reste</div>,
    cell: ({ row }) => {
      const remaining = row.getValue("remaining") as number;
      if (remaining <= 0) return <div className="text-right">—</div>;
      return (
        <div className="text-right text-destructive font-medium">
          {remaining.toLocaleString("fr-FR")} FCFA
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-right">Statut</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config = statusConfig[status] || { label: status, variant: "secondary" as const };
      return (
        <div className="text-right">
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
      );
    },
  },
];

export function makeSalesColumns(onPrint: (id: string) => void): ColumnDef<SaleRow>[] {
  return [
    ...baseColumns,
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onPrint(row.original.id);
            }}
            title="Imprimer la facture"
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            asChild
          >
            <Link href={`/sales/${row.original.id}`} title="Voir le détail">
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];
}
