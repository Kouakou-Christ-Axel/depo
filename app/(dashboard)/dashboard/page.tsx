import { getDashboard } from "@/features/reports/service";
import { listProducts } from "@/features/products/service";
import { getProductsLowStock } from "@/features/products/service";
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
import {
  ShoppingCart,
  Warehouse,
  Users,
  AlertTriangle,
  TrendingUp,
  Banknote,
} from "lucide-react";

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (_key, value) =>
    typeof value === "object" && value !== null && "toFixed" in value
      ? Number(value)
      : value
  ));
}

export default async function DashboardPage() {
  const [dashboard, rawProducts, rawLowStock] = await Promise.all([
    getDashboard(),
    listProducts(),
    getProductsLowStock(),
  ]);

  const products = serialize(rawProducts);
  const lowStock = serialize(rawLowStock);

  const stats = [
    {
      title: "Ventes du mois",
      value: `${dashboard.salesThisMonth.totalSales.toLocaleString("fr-FR")} FCFA`,
      description: `${dashboard.salesThisMonth.salesCount} vente(s) ce mois`,
      icon: ShoppingCart,
      variant: "default" as const,
    },
    {
      title: "Montant encaissé",
      value: `${dashboard.salesThisMonth.totalPaid.toLocaleString("fr-FR")} FCFA`,
      description: `${dashboard.salesThisMonth.totalUnpaid.toLocaleString("fr-FR")} FCFA impayé`,
      icon: Banknote,
      variant: "default" as const,
    },
    {
      title: "Valeur du stock",
      value: `${Math.round(dashboard.stock.totalValue).toLocaleString("fr-FR")} FCFA`,
      description: `${dashboard.stock.totalProducts} produit(s) actif(s)`,
      icon: Warehouse,
      variant: "default" as const,
    },
    {
      title: "Dettes clients",
      value: `${dashboard.debts.totalDebt.toLocaleString("fr-FR")} FCFA`,
      description: `${dashboard.debts.clientsWithDebt} client(s) endetté(s)`,
      icon: Users,
      variant: "default" as const,
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
        {/* Low stock alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Alertes stock bas
            </CardTitle>
            <CardDescription>
              Produits en dessous du seuil d&apos;alerte
            </CardDescription>
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

        {/* Products overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Produits
            </CardTitle>
            <CardDescription>
              {products.length} produit(s) au catalogue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Aucun produit enregistré
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className="text-right">Variantes</TableHead>
                    <TableHead className="text-right">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.slice(0, 10).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.variants.length}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={product.isActive ? "default" : "secondary"}
                        >
                          {product.isActive ? "Actif" : "Inactif"}
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
