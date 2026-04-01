import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus } from "lucide-react";
import { SalesView } from "./components/sales-view";
import { PermissionGate } from "@/components/permission-gate";

export default function SalesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ventes</h1>
          <p className="text-muted-foreground">
            Historique des ventes et factures
          </p>
        </div>
        <PermissionGate action="create" subject="Sale">
          <Button asChild>
            <Link href="/sales/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle vente
            </Link>
          </Button>
        </PermissionGate>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Ventes
          </CardTitle>
          <CardDescription>
            Filtrez par statut, client ou numéro de vente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SalesView />
        </CardContent>
      </Card>
    </div>
  );
}
