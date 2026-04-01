import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { ClientsView } from "./components/clients-view";
import { PermissionGate } from "@/components/permission-gate";

export default function ClientsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Gestion des clients et recouvrement des dettes
          </p>
        </div>
        <PermissionGate action="create" subject="Client">
          <Button asChild>
            <Link href="/clients/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau client
            </Link>
          </Button>
        </PermissionGate>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clients
          </CardTitle>
          <CardDescription>
            Filtrez par nom ou affichez uniquement les clients endettés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientsView />
        </CardContent>
      </Card>
    </div>
  );
}
