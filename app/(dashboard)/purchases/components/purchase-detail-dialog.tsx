"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface PurchaseRow {
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
}

interface PurchaseDetailDialogProps {
  purchase: PurchaseRow | null;
  open: boolean;
  onClose: () => void;
}

export function PurchaseDetailDialog({
  purchase,
  open,
  onClose,
}: PurchaseDetailDialogProps) {
  if (!purchase) return null;

  const date = new Date(purchase.createdAt).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Détail de l&apos;achat</DialogTitle>
          <DialogDescription>{date}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Produit</span>
              <p className="font-medium">
                {purchase.productName} — {purchase.variantName}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Fournisseur</span>
              <p className="font-medium">{purchase.supplierName || "—"}</p>
            </div>
          </div>

          {purchase.invoiceNumber && (
            <div className="text-sm">
              <span className="text-muted-foreground">N° Facture</span>
              <p className="font-mono">{purchase.invoiceNumber}</p>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Quantité</span>
              <p className="text-lg font-bold">{purchase.quantityCasier}</p>
              <span className="text-xs text-muted-foreground">casiers</span>
            </div>
            <div>
              <span className="text-muted-foreground">Prix/casier</span>
              <p className="text-lg font-bold">
                {purchase.purchasePriceCasier.toLocaleString("fr-FR")}
              </p>
              <span className="text-xs text-muted-foreground">FCFA</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total</span>
              <p className="text-lg font-bold">
                {purchase.totalAmount.toLocaleString("fr-FR")}
              </p>
              <span className="text-xs text-muted-foreground">FCFA</span>
            </div>
          </div>

          <Separator />

          <p className="text-xs text-muted-foreground">
            Enregistré par {purchase.createdByName}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
