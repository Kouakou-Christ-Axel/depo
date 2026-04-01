import { Badge } from "@/components/ui/badge";
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
import { Users } from "lucide-react";

interface TopClientsTableProps {
  data: {
    name: string;
    salesCount: number;
    totalBought: number;
    debt: number;
  }[];
}

export function TopClientsTable({ data }: TopClientsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Top clients acheteurs
        </CardTitle>
        <CardDescription>Par montant total acheté</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun client
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Ventes</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Dette</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((c) => (
                <TableRow key={c.name}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-right">{c.salesCount}</TableCell>
                  <TableCell className="text-right">
                    {c.totalBought.toLocaleString("fr-FR")} FCFA
                  </TableCell>
                  <TableCell className="text-right">
                    {c.debt > 0 ? (
                      <Badge variant="destructive">
                        {c.debt.toLocaleString("fr-FR")}
                      </Badge>
                    ) : (
                      "—"
                    )}
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
