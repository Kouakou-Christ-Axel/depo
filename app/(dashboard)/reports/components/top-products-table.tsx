import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package } from "lucide-react";

interface TopProductsTableProps {
  data: {
    name: string;
    quantityCasier: number;
    ca: number;
    pctCA: number;
  }[];
}

export function TopProductsTable({ data }: TopProductsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Top produits vendus
        </CardTitle>
        <CardDescription>Par chiffre d&apos;affaires</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune vente
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead className="text-right">Casiers</TableHead>
                <TableHead className="text-right">CA</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((p) => (
                <TableRow key={p.name}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-right">
                    {p.quantityCasier.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    {p.ca.toLocaleString("fr-FR")} FCFA
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {p.pctCA.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
