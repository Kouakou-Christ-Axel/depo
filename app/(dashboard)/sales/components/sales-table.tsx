"use client";

import { memo, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { makeSalesColumns } from "./sales-columns";
import { printInvoice, type InvoiceData } from "@/lib/print-invoice";
import type { SaleRow } from "../hooks/use-sales-query";

interface SalesTableProps {
  data: SaleRow[];
  totalPages: number;
}

export const SalesTable = memo(function SalesTable({
  data,
  totalPages,
}: SalesTableProps) {
  async function handlePrint(saleId: string) {
    const res = await fetch(`/api/sales/${saleId}`);
    if (!res.ok) return;
    const sale = await res.json();

    const invoiceData: InvoiceData = {
      saleNumber: sale.saleNumber,
      date: new Date(sale.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      clientName: sale.client?.name || "Vente comptoir",
      clientPhone: sale.client?.phone,
      items: sale.items,
      totalAmount: sale.totalAmount,
      amountPaid: sale.amountPaid,
      status: sale.status,
      vendeur: sale.createdBy.name || sale.createdBy.email,
      notes: sale.notes,
    };

    printInvoice(invoiceData);
  }

  const columns = useMemo(() => makeSalesColumns(handlePrint), []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
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
                Aucune vente trouvée.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
});
