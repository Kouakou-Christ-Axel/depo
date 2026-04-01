"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  HandCoins,
  FileText,
  Pencil,
  Printer,
} from "lucide-react";
import { useState } from "react";
import { printReceipt } from "@/lib/print-receipt";
import { ClientEditForm } from "./components/client-edit-form";
import { PaymentDialog } from "../components/payment-dialog";

interface ClientDetail {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  debtTotal: string;
  isActive: boolean;
  payments: {
    id: string;
    amount: string;
    method: string | null;
    reference: string | null;
    notes: string | null;
    paymentDate: string;
    createdBy: { name: string | null; email: string };
  }[];
  sales: {
    id: string;
    saleNumber: string;
    status: string;
    totalAmount: string;
    amountPaid: string;
    createdAt: string;
  }[];
}

const statusLabels: Record<string, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
  PAID: { label: "Payée", variant: "default" },
  PARTIAL: { label: "Partielle", variant: "outline" },
  UNPAID: { label: "Impayée", variant: "destructive" },
  CANCELLED: { label: "Annulée", variant: "secondary" },
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const { data: client, isLoading } = useQuery({
    queryKey: ["client", id],
    queryFn: async (): Promise<ClientDetail> => {
      const res = await fetch(`/api/clients/${id}`);
      if (!res.ok) throw new Error("Client introuvable");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Client introuvable</p>
      </div>
    );
  }

  const debt = Number(client.debtTotal);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground">
            {client.phone || "Pas de téléphone"} — {client.email || "Pas d'email"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
            <Pencil className="h-3 w-3 mr-1" />
            {editing ? "Annuler" : "Modifier"}
          </Button>
          {debt > 0 && (
            <Button size="sm" onClick={() => setPaymentOpen(true)}>
              <HandCoins className="h-3 w-3 mr-1" />
              Encaisser
            </Button>
          )}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <ClientEditForm
          client={client}
          onSuccess={() => {
            setEditing(false);
            queryClient.invalidateQueries({ queryKey: ["client", id] });
          }}
        />
      )}

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${debt > 0 ? "text-destructive" : "text-green-600"}`}>
              {debt > 0 ? `${debt.toLocaleString("fr-FR")} FCFA` : "Aucune"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.sales.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paiements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.payments.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payments history */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des paiements</CardTitle>
            <CardDescription>{client.payments.length} paiement(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {client.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun paiement</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Réf.</TableHead>
                    <TableHead className="text-right">Reçu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">
                        {new Date(p.paymentDate).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {Number(p.amount).toLocaleString("fr-FR")} FCFA
                      </TableCell>
                      <TableCell className="text-sm">{p.method || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.reference || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            printReceipt({
                              receiptId: p.id,
                              clientName: client.name,
                              amount: Number(p.amount),
                              method: p.method || "Espèces",
                              reference: p.reference,
                              date: new Date(p.paymentDate).toLocaleDateString("fr-FR"),
                            })
                          }
                        >
                          <Printer className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Sales history */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des ventes</CardTitle>
            <CardDescription>{client.sales.length} vente(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {client.sales.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune vente</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>N°</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Statut</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.sales.map((s) => {
                    const cfg = statusLabels[s.status] || { label: s.status, variant: "secondary" as const };
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="text-sm">
                          {new Date(s.createdAt).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{s.saleNumber}</TableCell>
                        <TableCell className="text-right font-medium">
                          {Number(s.totalAmount).toLocaleString("fr-FR")} FCFA
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                            <Link href={`/sales/${s.id}/invoice`}>
                              <FileText className="h-3 w-3" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment dialog */}
      <PaymentDialog
        open={paymentOpen}
        client={debt > 0 ? { id: client.id, name: client.name, debt } : null}
        onClose={() => setPaymentOpen(false)}
        onSuccess={() => {
          setPaymentOpen(false);
          queryClient.invalidateQueries({ queryKey: ["client", id] });
          queryClient.invalidateQueries({ queryKey: ["clients-list"] });
        }}
      />
    </div>
  );
}
