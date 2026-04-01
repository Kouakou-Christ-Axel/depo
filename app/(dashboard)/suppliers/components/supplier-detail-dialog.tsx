"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface SupplierRow {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
}

interface SupplierDetailDialogProps {
  supplier: SupplierRow | null;
  open: boolean;
  onClose: () => void;
}

export function SupplierDetailDialog({
  supplier,
  open,
  onClose,
}: SupplierDetailDialogProps) {
  if (!supplier) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{supplier.name}</DialogTitle>
          <DialogDescription>
            Fiche fournisseur
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-muted-foreground">Téléphone</span>
              <p className="font-medium">{supplier.phone || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email</span>
              <p className="font-medium">{supplier.email || "—"}</p>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Adresse</span>
            <p className="font-medium">{supplier.address || "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Statut</span>
            <div className="mt-1">
              <Badge variant={supplier.isActive ? "default" : "secondary"}>
                {supplier.isActive ? "Actif" : "Inactif"}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
