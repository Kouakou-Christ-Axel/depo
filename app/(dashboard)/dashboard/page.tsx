import Link from "next/link";
import { getDashboard } from "@/features/reports/service";
import { getProductsLowStock } from "@/features/products/service";
import { getClientsDebtReport } from "@/features/reports/service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingCart,
  Warehouse,
  Users,
  AlertTriangle,
  Banknote,
  HandCoins,
} from "lucide-react";

function serialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) =>
      typeof value === "object" && value !== null && "toFixed" in value
        ? Number(value)
        : value
    )
  );
}

export default async function DashboardPage() {
  const [dashboard, rawLowStock, rawDebtReport] = await Promise.all([
    getDashboard(),
    getProductsLowStock(),
    getClientsDebtReport(),
  ]);

  const lowStock = serialize(rawLowStock);
  const debtReport = serialize(rawDebtReport);

  const stats = [
    {
      title: "Ventes du mois",
      value: `${dashboard.salesThisMonth.totalSales.toLocaleString("fr-FR")} FCFA`,
      description: `${dashboard.salesThisMonth.salesCount} vente(s) ce mois`,
      icon: ShoppingCart,
    },
    {
      title: "Montant encaissé",
      value: `${dashboard.salesThisMonth.totalPaid.toLocaleString("fr-FR")} FCFA`,
      description: `${dashboard.salesThisMonth.totalUnpaid.toLocaleString("fr-FR")} FCFA impayé`,
      icon: Banknote,
    },
    {
      title: "Valeur du stock",
      value: `${Math.round(dashboard.stock.totalValue).toLocaleString("fr-FR")} FCFA`,
      description: `${dashboard.stock.totalProducts} produit(s) actif(s)`,
      icon: Warehouse,
    },
    {
      title: "Dettes clients",
      value: `${dashboard.debts.totalDebt.toLocaleString("fr-FR")} FCFA`,
      description: `${dashboard.debts.clientsWithDebt} client(s) endetté(s)`,
      icon: Users,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de votre dépôt de boissons
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Debt recovery */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HandCoins className="h-4 w-4 text-destructive" />
                Recouvrement
              </CardTitle>
              <CardDescription>
                {debtReport.summary.clientsWithDebt} client(s) endetté(s) —{" "}
                {debtReport.summary.totalDebt.toLocaleString("fr-FR")} FCFA
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/clients?dette=true">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {debtReport.clients.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Aucune dette en cours
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Dette</TableHead>
                    <TableHead className="text-right">Ventes impayées</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debtReport.clients.slice(0, 8).map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        {client.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive">
                          {Number(client.debtTotal).toLocaleString("fr-FR")} FCFA
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {client.sales.length}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Low stock alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Alertes stock bas
              </CardTitle>
              <CardDescription>
                Produits en dessous du seuil de sécurité
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/products">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Aucune alerte de stock bas
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Variante</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product.name}
                      </TableCell>
                      <TableCell>{item.variant.name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive">
                          {(item.stockHalf / 2).toFixed(1)} casiers
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
