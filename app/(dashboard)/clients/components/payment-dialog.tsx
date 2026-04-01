"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { recordClientPaymentAction } from "@/features/clients/actions/recordClientPayment.action";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, HandCoins, Printer } from "lucide-react";
import { useState, useEffect } from "react";
import { PAYMENT_METHODS } from "@/lib/constants";
import { printReceipt as printReceiptUtil } from "@/lib/print-receipt";

const formSchema = z.object({
  amount: z.number().positive("Le montant doit être positif"),
  method: z.string().min(1, "Choisissez une méthode"),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentDialogProps {
  open: boolean;
  client: { id: string; name: string; debt: number } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentDialog({ open, client, onClose, onSuccess }: PaymentDialogProps) {
  const [serverError, setServerError] = useState("");
  const [receipt, setReceipt] = useState<{
    id: string;
    amount: number;
    method: string;
    date: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      method: "Espèces",
      reference: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({ amount: 0, method: "Espèces", reference: "", notes: "" });
      setReceipt(null);
      setServerError("");
    }
  }, [open, reset]);

  async function onSubmit(data: FormValues) {
    if (!client) return;
    setServerError("");

    const result = await recordClientPaymentAction({
      clientId: client.id,
      amount: data.amount,
      method: data.method || undefined,
      reference: data.reference || undefined,
      notes: data.notes || undefined,
    });

    if (!result.success) {
      setServerError(result.error ?? "Erreur");
      return;
    }

    setReceipt({
      id: result.data!.payment.id,
      amount: data.amount,
      method: data.method,
      date: new Date().toLocaleDateString("fr-FR"),
    });

    onSuccess();
  }

  function handlePrintReceipt() {
    if (!receipt || !client) return;
    printReceiptUtil({
      receiptId: receipt.id,
      clientName: client.name,
      amount: receipt.amount,
      method: receipt.method,
      date: receipt.date,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="h-5 w-5" />
            Encaisser
          </DialogTitle>
          <DialogDescription>
            Paiement pour {client?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Debt summary */}
          <div className="rounded-lg border bg-destructive/5 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Dette actuelle</span>
              <span className="font-bold text-destructive">
                {client?.debt.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          </div>

          {receipt ? (
            <div className="space-y-3">
              <div className="rounded-lg border bg-green-50 p-4 text-center dark:bg-green-950/20">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Paiement enregistré
                </p>
                <p className="text-2xl font-bold mt-1">
                  {receipt.amount.toLocaleString("fr-FR")} FCFA
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePrintReceipt} className="flex-1">
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimer le reçu
                </Button>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Fermer
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid gap-2">
                <Label htmlFor="pay-amount">Montant (FCFA) *</Label>
                <Input
                  id="pay-amount"
                  type="number"
                  min={1}
                  max={client?.debt}
                  placeholder="Montant à encaisser"
                  {...register("amount", {
                    setValueAs: (v: string) => (v === "" ? 0 : Number(v)),
                  })}
                />
                {errors.amount && (
                  <p className="text-xs text-destructive">{errors.amount.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pay-method">Méthode *</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  {...register("method")}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pay-ref">Référence</Label>
                <Input id="pay-ref" placeholder="N° transaction..." {...register("reference")} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pay-notes">Notes</Label>
                <Input id="pay-notes" placeholder="Remarques..." {...register("notes")} />
              </div>

              <Separator />

              {serverError && <p className="text-sm text-destructive">{serverError}</p>}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer le paiement
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
