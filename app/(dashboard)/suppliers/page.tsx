import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";
import { SuppliersTable } from "./components/suppliers-table";
import { PermissionGate } from "@/components/permission-gate";

export default function SuppliersPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fournisseurs</h1>
          <p className="text-muted-foreground">
            Gérez vos fournisseurs de boissons
          </p>
        </div>
        <PermissionGate action="create" subject="Supplier">
          <Button asChild>
            <Link href="/suppliers/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau fournisseur
            </Link>
          </Button>
        </PermissionGate>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Fournisseurs
          </CardTitle>
          <CardDescription>
            Liste de vos fournisseurs avec coordonnées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SuppliersTable />
        </CardContent>
      </Card>
    </div>
  );
}
