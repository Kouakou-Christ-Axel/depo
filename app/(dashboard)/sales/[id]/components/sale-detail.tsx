"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Printer, Package } from "lucide-react";
import { printInvoice } from "@/lib/print-invoice";

interface SaleData {
  id: string;
  saleNumber: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
  notes: string | null;
  createdAt: string;
  client: { id: string; name: string; phone: string | null } | null;
  createdBy: { id: string; name: string | null; email: string };
  items: {
    id: string;
    productName: string;
    variantName: string;
    quantityHalf: number;
    unitPrice: number;
    subtotal: number;
  }[];
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PAID: { label: "Payée", variant: "default" },
  PARTIAL: { label: "Partielle", variant: "outline" },
  UNPAID: { label: "Impayée", variant: "destructive" },
  CANCELLED: { label: "Annulée", variant: "secondary" },
};

export function SaleDetail({ sale }: { sale: SaleData }) {
  const date = new Date(sale.createdAt).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const remaining = sale.totalAmount - sale.amountPaid;
  const cfg = statusConfig[sale.status] || { label: sale.status, variant: "secondary" as const };

  function handlePrint() {
    printInvoice({
      saleNumber: sale.saleNumber,
      date,
      clientName: sale.client?.name || "Vente comptoir",
      clientPhone: sale.client?.phone,
      items: sale.items,
      totalAmount: sale.totalAmount,
      amountPaid: sale.amountPaid,
      status: sale.status,
      vendeur: sale.createdBy.name || sale.createdBy.email,
      notes: sale.notes,
    });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/sales">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {sale.saleNumber}
            </h1>
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </div>
          <p className="text-muted-foreground">
            {date} — {sale.client?.name || "Vente comptoir"} — Vendeur :{" "}
            {sale.createdBy.name || sale.createdBy.email}
          </p>
        </div>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimer la facture
        </Button>
      </div>

      {/* Layout: items left, invoice summary right */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: items detail */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Casiers vendus
              </CardTitle>
              <CardDescription>
                {sale.items.length} article(s) —{" "}
                {sale.items
                  .reduce((sum, i) => sum + i.quantityHalf / 2, 0)
                  .toFixed(1)}{" "}
                casier(s) au total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead className="text-right">Qté (casiers)</TableHead>
                    <TableHead className="text-right">Prix/casier</TableHead>
                    <TableHead className="text-right">Sous-total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.variantName}
                      </TableCell>
                      <TableCell className="text-right">
                        {(item.quantityHalf / 2).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        {(item.unitPrice * 2).toLocaleString("fr-FR")} FCFA
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.subtotal.toLocaleString("fr-FR")} FCFA
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right: invoice summary */}
        <div className="lg:col-span-2 space-y-4">
          {/* Client */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Client</CardTitle>
            </CardHeader>
            <CardContent>
              {sale.client ? (
                <div>
                  <Link
                    href={`/clients/${sale.client.id}`}
                    className="font-medium hover:underline"
                  >
                    {sale.client.name}
                  </Link>
                  {sale.client.phone && (
                    <p className="text-sm text-muted-foreground">
                      {sale.client.phone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Vente comptoir</p>
              )}
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Facturation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total</span>
                <span className="text-lg font-bold">
                  {sale.totalAmount.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Payé</span>
                <span>{sale.amountPaid.toLocaleString("fr-FR")} FCFA</span>
              </div>
              {remaining > 0 && (
                <div className="flex justify-between text-sm font-medium text-destructive border-t pt-2">
                  <span>Reste à payer</span>
                  <span>{remaining.toLocaleString("fr-FR")} FCFA</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {sale.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{sale.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
