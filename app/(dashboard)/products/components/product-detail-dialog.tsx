'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import type { ProductRow } from './columns';

interface ProductDetailDialogProps {
  productName: string | null;
  rows: ProductRow[];
  open: boolean;
  onClose: () => void;
}

export function ProductDetailDialog({
  productName,
  rows,
  open,
  onClose,
}: ProductDetailDialogProps) {
  if (!productName) return null;

  const totalStock = rows.reduce((s, r) => s + r.stockHalf / 2, 0);
  const totalValue = rows.reduce(
    (s, r) => s + (r.stockHalf / 2) * r.averageCostCasier,
    0
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{productName}</DialogTitle>
          <DialogDescription>
            {rows.length} variante(s) — {totalStock.toFixed(1)} casiers en stock
          </DialogDescription>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Taille</TableHead>
              <TableHead>Casier</TableHead>
              <TableHead className="text-right">Prix vente</TableHead>
              <TableHead className="text-right">Coût moyen</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Seuil</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const stock = r.stockHalf / 2;
              const threshold = r.alertThresholdHalf / 2;
              const isLow = r.stockHalf <= r.alertThresholdHalf;
              const isEmpty = r.stockHalf === 0;

              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.variantName}</TableCell>
                  <TableCell>{r.casierSize} btl</TableCell>
                  <TableCell className="text-right">
                    {r.sellingPriceCasier.toLocaleString('fr-FR')} FCFA
                  </TableCell>
                  <TableCell className="text-right">
                    {r.averageCostCasier.toLocaleString('fr-FR')} FCFA
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1">
                      {isEmpty ? (
                        <AlertTriangle className="h-3 w-3 text-destructive" />
                      ) : isLow ? (
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                      ) : (
                        <ShieldCheck className="h-3 w-3 text-green-600" />
                      )}
                      {stock.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {threshold.toFixed(1)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="flex justify-between text-sm pt-2 border-t">
          <span className="text-muted-foreground">Valeur stock estimée</span>
          <span className="font-medium">
            {Math.round(totalValue).toLocaleString('fr-FR')} FCFA
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
