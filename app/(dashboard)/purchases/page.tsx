import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Plus } from "lucide-react";
import { PurchasesTable } from "./components/purchases-table";

export default function PurchasesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Achats</h1>
          <p className="text-muted-foreground">
            Historique des achats fournisseurs
          </p>
        </div>
        <Button asChild>
          <Link href="/purchases/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel achat
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Achats fournisseurs
          </CardTitle>
          <CardDescription>
            Liste paginée avec filtres par produit, fournisseur ou facture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PurchasesTable />
        </CardContent>
      </Card>
    </div>
  );
}
